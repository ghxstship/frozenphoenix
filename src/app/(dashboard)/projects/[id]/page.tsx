"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_APPROVALS, MOCK_STAKEHOLDERS } from "@/lib/demo-data";
import { PROJECT_PHASE_MAP } from "@/config/domain-config";
import { useUpdateProject, useDeleteProject, useCreateTask, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
    Edit,
    DollarSign,
    Users,
    CheckSquare,
    Clock,
    TrendingUp,
    AlertTriangle,
    FolderKanban,
    Loader2,
} from "lucide-react";

type TabId = "overview" | "tasks" | "team" | "budget" | "approvals";

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [addTaskOpen, setAddTaskOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();
    const createTask = useCreateTask();

    const project = MOCK_PROJECTS.find((p) => p.id === projectId);

    const handleArchive = async () => {
        if (!isSupabaseConfigured) return;
        try {
            await updateProject.mutateAsync({ id: projectId, status: "completed" } as unknown as Parameters<typeof updateProject.mutateAsync>[0]);
        } catch (error) {
            console.error("Failed to archive project:", error);
        }
    };

    const handleDelete = async () => {
        if (!isSupabaseConfigured) return;
        try {
            await deleteProject.mutateAsync(projectId);
            router.push("/projects");
        } catch (error) {
            console.error("Failed to delete project:", error);
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
            console.error("Failed to add task:", error);
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
    const budgetUtilization = project.budgetPlanned > 0
        ? Math.round((project.budgetActual / project.budgetPlanned) * 100)
        : 0;
    const pendingApprovals = projectApprovals.filter((a) => a.status === "pending" || a.status === "overdue");
    const completedTasks = projectTasks.filter((t) => t.status === "done").length;

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "tasks" as const, label: "Tasks", count: projectTasks.length },
        { id: "team" as const, label: "Team", count: projectStakeholders.length },
        { id: "budget" as const, label: "Budget" },
        { id: "approvals" as const, label: "Approvals", count: pendingApprovals.length },
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
                            {pendingApprovals.length} approval{pendingApprovals.length > 1 ? "s" : ""} waiting
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
                { label: updateProject.isPending ? "Archiving..." : "Archive Project", onClick: handleArchive },
                { label: deleteProject.isPending ? "Deleting..." : "Delete Project", onClick: handleDelete, variant: "destructive" },
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
                                <p className="text-xl font-bold">{formatCurrency(project.budgetPlanned)}</p>
                                <p className="text-xs text-muted-foreground">{budgetUtilization}% utilized</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <CheckSquare className="h-4 w-4" />
                                    <span className="text-xs">Tasks</span>
                                </div>
                                <p className="text-xl font-bold">{completedTasks}/{projectTasks.length}</p>
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

                    {/* Recent Tasks */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Recent Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {projectTasks.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {projectTasks.slice(0, 5).map((task) => (
                                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                            <div>
                                                <p className="text-sm font-medium">{task.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {task.dueDate && `Due ${formatDate(task.dueDate)}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <PriorityBadge priority={task.priority} className="text-[10px]" />
                                                <StatusBadge status={task.status} className="text-[10px]" />
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
                        <Button size="sm" onClick={() => setAddTaskOpen(true)}>Add Task</Button>
                    </CardHeader>
                    <CardContent>
                        {projectTasks.length === 0 ? (
                            <EmptyState
                                icon={CheckSquare}
                                title="No tasks"
                                description="Create your first task for this project"
                                action={{ label: "Add Task", onClick: () => setAddTaskOpen(true) }}
                            />
                        ) : (
                            <div className="space-y-2">
                                {projectTasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full ${task.status === "done" ? "bg-success" : task.status === "in_progress" ? "bg-info" : "bg-muted-foreground"}`} />
                                            <div>
                                                <p className="text-sm font-medium">{task.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {PROJECT_PHASE_MAP[task.phase]?.label}
                                                    {task.dueDate && ` · Due ${formatDate(task.dueDate)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <PriorityBadge priority={task.priority} className="text-[10px]" />
                                            <StatusBadge status={task.status} className="text-[10px]" />
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
                                action={{ label: "Add Member", onClick: () => {} /* TODO: wire add member dialog */ }}
                            />
                        ) : (
                            <div className="space-y-3">
                                {projectStakeholders.map((person) => (
                                    <div key={person.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                                                {person.name.split(" ").map((n) => n[0]).join("")}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{person.name}</p>
                                                <p className="text-xs text-muted-foreground">{person.role}</p>
                                            </div>
                                        </div>
                                        <Badge variant={person.type === "internal" ? "default" : person.type === "client" ? "warning" : "secondary"}>
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
                        <StatCard title="Planned Budget" value={formatCurrency(project.budgetPlanned)} />
                        <StatCard title="Actual Spend" value={formatCurrency(project.budgetActual)} />
                        <StatCard title="Remaining" value={formatCurrency(project.budgetPlanned - project.budgetActual)} />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Budget Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Budget line items will be displayed here when connected to Supabase
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
                                    <div key={approval.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                                        <div>
                                            <p className="text-sm font-medium">{approval.milestoneName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Deadline: {formatDate(approval.deadline)} · Approver: {approval.approverName}
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
                        <Button variant="ghost" onClick={() => setAddTaskOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddTask} disabled={!taskTitle.trim() || createTask.isPending}>
                            {createTask.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Add Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
