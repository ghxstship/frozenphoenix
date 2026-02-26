"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTasks, useProjects, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { MOCK_TASKS, MOCK_PROJECTS } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, List, LayoutGrid, Loader2, Table2 } from "lucide-react";
import {
    TASK_STATUS_MAP as TASK_STATUS_CONFIG,
    TASK_PRIORITY_MAP as TASK_PRIORITY_CONFIG,
    FABRICATION_STATUS_MAP as FABRICATION_STATUS_CONFIG,
} from "@/config/domain-config";
import type { Task, TaskStatus, TaskPriority, ProjectPhase, FabricationStatus, Project, ProjectStatus } from "@/types";
import { DataTable, type ColumnDef } from "@/components/data-view/data-table";
import { DataBoard, type BoardColumn, type CardField } from "@/components/data-view/data-board";
import { CurrencyField, DateField, PriorityField } from "@/components/data-view/field-renderers";

type ViewMode = "list" | "table" | "board";

// ─── Table Columns Definition ───
const createTableColumns = (projects: Project[]): ColumnDef<Task>[] => [
    {
        id: "title",
        header: "Task",
        accessorKey: "title",
        sticky: true,
        minWidth: 250,
        render: (value, row) => {
            const project = projects.find(p => p.id === row.projectId);
            return (
                <div>
                    <div className="font-medium">{String(value)}</div>
                    <div className="text-xs text-muted-foreground">{project?.name ?? "Unknown Project"}</div>
                </div>
            );
        },
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        fieldType: "status",
        fieldConfig: {
            variantMap: Object.fromEntries(
                Object.entries(TASK_STATUS_CONFIG).map(([k, v]) => [k, v.variant])
            ),
            labelMap: Object.fromEntries(
                Object.entries(TASK_STATUS_CONFIG).map(([k, v]) => [k, v.label])
            ),
        },
        width: 120,
    },
    {
        id: "priority",
        header: "Priority",
        accessorKey: "priority",
        render: (value) => <PriorityField value={String(value)} />,
        width: 100,
    },
    {
        id: "fabricationStatus",
        header: "Fab Status",
        accessorKey: "fabricationStatus",
        render: (value) => value ? (
            <Badge variant="secondary" className="text-xs">
                {FABRICATION_STATUS_CONFIG[value as FabricationStatus]?.label ?? value}
            </Badge>
        ) : <span className="text-muted-foreground">—</span>,
        width: 120,
    },
    {
        id: "materialCost",
        header: "Material Cost",
        accessorKey: "materialCost",
        render: (value) => value ? <CurrencyField value={value as number} /> : <span className="text-muted-foreground">—</span>,
        width: 120,
        align: "right",
    },
    {
        id: "dueDate",
        header: "Due Date",
        accessorKey: "dueDate",
        render: (value) => value ? <DateField value={value as string} showOverdue /> : <span className="text-muted-foreground">—</span>,
        width: 120,
    },
    {
        id: "dependencies",
        header: "Deps",
        accessorFn: (row) => row.dependencies.length,
        render: (value) => (
            <span className="text-xs text-muted-foreground">
                {Number(value) > 0 ? `${value} deps` : "none"}
            </span>
        ),
        width: 80,
        align: "center",
    },
];

// ─── Board Columns Definition ───
const boardColumns: BoardColumn<Task>[] = [
    { id: "backlog", title: "Backlog", variant: "ghost", filter: (t) => t.status === "backlog" },
    { id: "todo", title: "To Do", variant: "secondary", filter: (t) => t.status === "todo" },
    { id: "in_progress", title: "In Progress", variant: "info", filter: (t) => t.status === "in_progress" },
    { id: "review", title: "Review", variant: "warning", filter: (t) => t.status === "review" },
    { id: "done", title: "Done", variant: "success", filter: (t) => t.status === "done" },
];

// ─── Board Card Fields ───
const boardCardFields: CardField<Task>[] = [
    {
        id: "priority",
        position: "header",
        accessorKey: "priority",
        render: (value) => <PriorityField value={String(value)} size="sm" />,
    },
    {
        id: "fabrication",
        label: "Fab",
        accessorKey: "fabricationStatus",
        render: (value) => value ? (
            <span className="text-xs">{FABRICATION_STATUS_CONFIG[value as FabricationStatus]?.label}</span>
        ) : null,
    },
    {
        id: "cost",
        label: "Material",
        accessorKey: "materialCost",
        render: (value) => value ? <CurrencyField value={value as number} compact /> : null,
        position: "footer",
    },
];

export default function TasksPage() {
    const [view, setView] = useState<ViewMode>("list");
    const [filterProject, setFilterProject] = useState<string>("all");

    const { data: sbTasks, isLoading: loadingTasks } = useTasks();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();

    const allTasks = isSupabaseConfigured && sbTasks ? sbTasks.map(t => ({
        id: t.id,
        projectId: t.project_id,
        parentId: t.parent_id ?? undefined,
        title: t.title,
        description: t.description ?? undefined,
        status: t.status as TaskStatus,
        priority: t.priority as TaskPriority,
        assigneeId: t.assignee_id ?? undefined,
        phase: t.phase as ProjectPhase,
        fabricationStatus: t.fabrication_status as FabricationStatus | undefined,
        materialCost: t.material_cost ?? undefined,
        startDate: t.start_date ?? undefined,
        dueDate: t.due_date ?? undefined,
        completedAt: t.completed_at ?? undefined,
        dependencies: (t as { task_dependencies?: { depends_on_id: string }[] }).task_dependencies?.map((d: { depends_on_id: string }) => d.depends_on_id) || [],
        createdAt: t.created_at ?? new Date().toISOString(),
    })) : MOCK_TASKS;

    const projects: Project[] = isSupabaseConfigured && sbProjects ? sbProjects.map(p => ({
        id: p.id,
        name: p.name,
        client: p.client,
        clientLogo: p.client_logo ?? undefined,
        status: p.status as ProjectStatus,
        currentPhase: p.current_phase as ProjectPhase,
        startDate: p.start_date,
        endDate: p.end_date,
        budgetPlanned: p.budget_planned,
        budgetActual: p.budget_actual,
        progress: p.progress,
        managerId: p.manager_id ?? '',
        teamIds: [],
        createdAt: p.created_at ?? new Date().toISOString(),
    })) : MOCK_PROJECTS;

    const isLoading = isSupabaseConfigured && (loadingTasks || loadingProjects);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const tasks = filterProject === "all"
        ? allTasks
        : allTasks.filter((t) => t.projectId === filterProject);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Tasks" description="Granular task management with fabrication tracking">
                <div className="flex items-center gap-2">
                    <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                    >
                        <option value="all">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <div className="flex rounded-lg border border-input overflow-hidden">
                        <button
                            onClick={() => setView("list")}
                            className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                            title="List View"
                        >
                            <List className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setView("table")}
                            className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "table" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                            title="Table View"
                        >
                            <Table2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setView("board")}
                            className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "board" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                            title="Board View"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <Button size="sm">
                        <Plus className="h-4 w-4" />
                        New Task
                    </Button>
                </div>
            </PageHeader>

            {/* Table View - using DataTable component */}
            {view === "table" && (
                <DataTable
                    data={tasks}
                    columns={createTableColumns(projects)}
                    keyField="id"
                    sortable
                    searchable
                    searchPlaceholder="Search tasks..."
                    pagination
                    pageSize={15}
                    hoverable
                    stickyHeader
                />
            )}

            {/* Board View - using DataBoard component */}
            {view === "board" && (
                <DataBoard
                    data={tasks}
                    columns={boardColumns}
                    keyField="id"
                    cardFields={boardCardFields}
                    cardTitle="title"
                    columnWidth={280}
                />
            )}

            {/* List View - original compact list */}
            {view === "list" && (
                <div className="spatial-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Task</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Priority</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Fab Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Material Cost</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Due Date</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground hidden xl:table-cell">Dependencies</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => {
                                const project = projects.find(p => p.id === task.projectId);
                                return (
                                    <tr
                                        key={task.id}
                                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium">{task.title}</p>
                                                <p className="text-[11px] text-muted-foreground">{project?.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={TASK_STATUS_CONFIG[task.status].variant} className="text-[10px]">
                                                {TASK_STATUS_CONFIG[task.status].label}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={TASK_PRIORITY_CONFIG[task.priority].variant} className="text-[10px]">
                                                {TASK_PRIORITY_CONFIG[task.priority].label}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            {task.fabricationStatus ? (
                                                <span className="text-xs font-medium">{FABRICATION_STATUS_CONFIG[task.fabricationStatus].label}</span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-xs font-medium">
                                                {task.materialCost ? formatCurrency(task.materialCost) : "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-xs text-muted-foreground">
                                                {task.dueDate ? formatDate(task.dueDate) : "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden xl:table-cell">
                                            {task.dependencies.length > 0 ? (
                                                <span className="text-[10px] text-muted-foreground">{task.dependencies.length} deps</span>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">none</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
