"use client";

import { logger } from "@/lib/logger";
import React, { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useParams, useRouter } from "next/navigation";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { useDeleteTask, useProjects, useTasks, useUpdateTask } from "@/lib/supabase/hooks";
import { useTask } from "@/lib/supabase/hooks-pages";
import { FABRICATION_STATUS_MAP, PROJECT_PHASE_MAP } from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    CheckSquare,
    Clock,
    DollarSign,
    Edit,
    Link2,
    Loader2,
    MessageSquare,
    User,
} from "lucide-react";

type TabId = "overview" | "subtasks" | "comments" | "chatter";
const TAB_VALUES = ["overview", "subtasks", "comments", "chatter"] as const;

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params.id as string;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());
    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Sarah Chen",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    const { data: task, isLoading } = useTask(taskId);
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!task) {
        return (
            <EmptyState
                icon={CheckSquare}
                title="Task not found"
                description="The task you're looking for doesn't exist."
                action={{ label: "Back to Tasks", onClick: () => router.push("/tasks") }}
            />
        );
    }

    const phaseConfig = PROJECT_PHASE_MAP[task.phase as keyof typeof PROJECT_PHASE_MAP];
    const fabConfig = task.fabricationStatus
        ? FABRICATION_STATUS_MAP[task.fabricationStatus as keyof typeof FABRICATION_STATUS_MAP]
        : null;

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "subtasks" as const, label: "Subtasks", count: 0 },
        { id: "comments" as const, label: "Comments", count: 0 },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Task Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <StatusBadge status={task.status} />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Phase</span>
                        <Badge variant={phaseConfig.variant}>{phaseConfig.label}</Badge>
                    </div>
                    {task.dueDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Due Date</span>
                            <span>{formatDate(task.dueDate)}</span>
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
                        <p className="text-xs text-muted-foreground mt-1">{project.client}</p>
                    </CardContent>
                </Card>
            )}

            {task.assigneeId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Assignee</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{task.assigneeName || "Assigned"}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    return (
        <DetailLayout
            backHref="/tasks"
            backLabel="Tasks"
            entityType="tasks"
            entityId={taskId}
            title={task.title}
            subtitle={project?.name}
            status={task.status}
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
            menuItems={[
                {
                    label: updateTask.isPending ? "Completing..." : "Mark Complete",
                    onClick: handleMarkComplete,
                },
                { label: "Duplicate Task", onClick: () => {} },
                {
                    label: deleteTask.isPending ? "Deleting..." : "Delete Task",
                    onClick: handleDeleteTask,
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
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs">Estimated Hours</span>
                                </div>
                                <p className="text-xl font-bold">{task.estimatedHours || 0}h</p>
                            </CardContent>
                        </Card>
                        {task.materialCost !== undefined && (
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-xs">Material Cost</span>
                                    </div>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(task.materialCost)}
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
                                <p className="text-xl font-bold">
                                    {task.dependencies?.length || 0}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Dependencies */}
                    {task.dependencies && task.dependencies.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Dependencies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {task.dependencies.map((depId: string) => {
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
            )}

            {activeTab === "subtasks" && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Subtasks</CardTitle>
                        <Button size="sm">Add Subtask</Button>
                    </CardHeader>
                    <CardContent>
                        <EmptyState
                            icon={CheckSquare}
                            title="No subtasks"
                            description="Break this task into smaller subtasks"
                            action={{ label: "Add Subtask", onClick: () => {} }}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "comments" && (
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
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="task"
                    recordId={taskId}
                    activityItems={makeMockActivity("task")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
