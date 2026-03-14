"use client";

import { useParams, useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { useProjects, useTasks, useUpdateTask } from "@/lib/supabase/hooks";
import { useDeleteTask, useTask } from "@/lib/supabase/hooks-pages";
import { FABRICATION_STATUS_MAP, PROJECT_PHASE_MAP } from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { CheckSquare, Clock, DollarSign, Edit, Link2, MessageSquare, User } from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "tasks",
    titleKey: "title",
    subtitleFn: (r) => {
        const projectName = String(r._projectName ?? "");
        return projectName;
    },
    statusKey: "status",
    icon: CheckSquare,
    backHref: "/tasks",
    backLabel: "Tasks",
    chatterRecordType: "task",
    fields: [],
    tabs: [],
};

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params.id as string;
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    const { data: task, isLoading } = useTask(taskId);
    const rec = task as Record<string, unknown> | null;
    const { data: sbProjects } = useProjects();
    const { data: sbTasks } = useTasks();
    const project = task
        ? (sbProjects ?? []).find(
              (p: Record<string, unknown>) => p.id === (task as Record<string, unknown>).project_id
          )
        : null;

    const handleMarkComplete = async () => {
        try {
            await updateTask.mutateAsync({ id: taskId, status: "done" } as unknown as Parameters<
                typeof updateTask.mutateAsync
            >[0]);
        } catch (error) {
            logger.error("Failed to mark task complete", { error });
        }
    };

    const handleDeleteTask = async () => {
        try {
            await deleteTask.mutateAsync(taskId);
            router.push("/tasks");
        } catch (error) {
            logger.error("Failed to delete task", { error });
        }
    };

    const taskStatus = String(rec?.status ?? "");
    const taskPriority = String(rec?.priority ?? "medium");
    const taskPhase = String(rec?.phase ?? "");
    const taskDueDate = String(rec?.due_date ?? "");
    const taskAssigneeId = String(rec?.assignee_id ?? "");
    const taskDescription = String(rec?.description ?? "");
    const taskEstimatedHours = (rec?.estimated_hours as number) ?? 0;
    const taskMaterialCost = rec?.material_cost as number | undefined;
    const taskFabricationStatus = String(rec?.fabrication_status ?? "");
    const taskBlockers = Array.isArray(rec?.blockers) ? (rec.blockers as string[]) : [];

    const phaseConfig = PROJECT_PHASE_MAP[taskPhase as keyof typeof PROJECT_PHASE_MAP];
    const fabConfig = taskFabricationStatus
        ? FABRICATION_STATUS_MAP[taskFabricationStatus as keyof typeof FABRICATION_STATUS_MAP]
        : null;

    const enrichedRecord = rec ? { ...rec, _projectName: project?.name ?? "" } : null;

    const sidebarSlot = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Task Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <StatusBadge status={taskStatus} />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <PriorityBadge priority={taskPriority} />
                    </div>
                    {phaseConfig && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phase</span>
                            <Badge variant={phaseConfig.variant}>{phaseConfig.label}</Badge>
                        </div>
                    )}
                    {taskDueDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Due Date</span>
                            <span>{formatDate(taskDueDate)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            {project && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <button
                            onClick={() => router.push(`/projects/${project.id}`)}
                            className="text-sm text-primary hover:underline"
                        >
                            {project.name}
                        </button>
                        <p className="text-xs text-muted-foreground mt-1">
                            {(project as Record<string, unknown>).client as string}
                        </p>
                    </CardContent>
                </Card>
            )}
            {taskAssigneeId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Assignee</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{taskAssigneeId}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const overviewSlot = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs">Estimated Hours</span>
                        </div>
                        <p className="text-xl font-bold">{taskEstimatedHours || 0}h</p>
                    </CardContent>
                </Card>
                {taskMaterialCost !== undefined && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs">Material Cost</span>
                            </div>
                            <p className="text-xl font-bold">
                                {formatCurrency(taskMaterialCost ?? 0)}
                            </p>
                        </CardContent>
                    </Card>
                )}
                {fabConfig && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <CheckSquare className="h-4 w-4" />
                                <span className="text-xs">Fabrication</span>
                            </div>
                            <Badge variant={fabConfig.variant}>{fabConfig.label}</Badge>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Link2 className="h-4 w-4" />
                            <span className="text-xs">Dependencies</span>
                        </div>
                        <p className="text-xl font-bold">{taskBlockers.length}</p>
                    </CardContent>
                </Card>
            </div>
            {taskDescription && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {taskDescription}
                        </p>
                    </CardContent>
                </Card>
            )}
            {taskBlockers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Dependencies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {taskBlockers.map((depId: string) => {
                                const depTask = (sbTasks ?? []).find(
                                    (t: Record<string, unknown>) => t.id === depId
                                );
                                if (!depTask) return null;
                                return (
                                    <div
                                        key={depId}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Link2 className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{depTask.title}</span>
                                        </div>
                                        <StatusBadge status={depTask.status} />
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "subtasks",
                label: "Subtasks",
                content: (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Subtasks</CardTitle>
                            <Button
                                size="sm"
                                onClick={() => router.push(`/tasks/new?parentId=${taskId}`)}
                            >
                                Add Subtask
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <EmptyState
                                icon={CheckSquare}
                                title="No subtasks"
                                description="Break this task into smaller subtasks"
                                action={{
                                    label: "Add Subtask",
                                    onClick: () => router.push(`/tasks/new?parentId=${taskId}`),
                                }}
                            />
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "comments",
                label: "Comments",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Comments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EmptyState
                                icon={MessageSquare}
                                title="No comments"
                                description="Start a discussion about this task"
                            />
                        </CardContent>
                    </Card>
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={taskId}
            record={enrichedRecord}
            isLoading={isLoading}
            menuItems={[
                {
                    label: updateTask.isPending ? "Completing..." : "Mark Complete",
                    onClick: handleMarkComplete,
                },
                {
                    label: "Duplicate Task",
                    onClick: () => router.push(`/tasks/new?duplicateFrom=${taskId}`),
                },
                {
                    label: deleteTask.isPending ? "Deleting..." : "Delete Task",
                    onClick: handleDeleteTask,
                    variant: "destructive",
                },
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <CheckSquare className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button onClick={() => router.push(`/tasks/${taskId}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
        />
    );
}
