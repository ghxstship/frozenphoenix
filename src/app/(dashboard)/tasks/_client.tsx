"use client";

import React, { useMemo, useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { useProjects, useTasks } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckSquare } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { TASKS_PAGE } from "@/config/list-page-configs";
import {
    FABRICATION_STATUS_MAP as FABRICATION_STATUS_CONFIG,
    TASK_PRIORITY_MAP as TASK_PRIORITY_CONFIG,
    TASK_STATUS_MAP as TASK_STATUS_CONFIG,
} from "@/config/domain-config";
import type {
    FabricationStatus,
    Project,
    ProjectPhase,
    ProjectStatus,
    Task,
    TaskPriority,
    TaskStatus,
} from "@/types";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { type BoardColumn, type CardField, DataBoard } from "@/components/data-view/data-board";
import { CurrencyField, DateField, PriorityField } from "@/components/data-view/field-renderers";
import { ListPageShell } from "@/components/shells/list-page-shell";
import type { ListPageConfig } from "@/types/list-page-config";

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
            const project = projects.find((p) => p.id === row.projectId);
            return (
                <div>
                    <div className="font-medium">{String(value)}</div>
                    <div className="text-xs text-muted-foreground">
                        {project?.name ?? "Unknown Project"}
                    </div>
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
        render: (value) =>
            value ? (
                <Badge variant="secondary" className="text-xs">
                    {FABRICATION_STATUS_CONFIG[value as FabricationStatus]?.label ?? value}
                </Badge>
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
        width: 120,
    },
    {
        id: "materialCost",
        header: "Material Cost",
        accessorKey: "materialCost",
        render: (value) =>
            value ? (
                <CurrencyField value={value as number} />
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
        width: 120,
        align: "right",
    },
    {
        id: "dueDate",
        header: "Due Date",
        accessorKey: "dueDate",
        render: (value) =>
            value ? (
                <DateField value={value as string} showOverdue />
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
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
    {
        id: "in_progress",
        title: "In Progress",
        variant: "info",
        filter: (t) => t.status === "in_progress",
    },
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
        render: (value) =>
            value ? (
                <span className="text-xs">
                    {FABRICATION_STATUS_CONFIG[value as FabricationStatus]?.label}
                </span>
            ) : null,
    },
    {
        id: "cost",
        label: "Material",
        accessorKey: "materialCost",
        render: (value) => (value ? <CurrencyField value={value as number} compact /> : null),
        position: "footer",
    },
];

// ─── Content Component ──────────────────────────────────────
function TasksContent({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
    const VIEW_MODES = ["list", "table", "board"] as const;
    const [view, setView] = useQueryTabState({
        key: "view",
        defaultValue: "list",
        validValues: VIEW_MODES,
    });
    const [filterProject, setFilterProject] = useState<string>("all");

    const filteredTasks =
        filterProject === "all" ? tasks : tasks.filter((t) => t.projectId === filterProject);

    return (
        <>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                >
                    <option value="all">All Projects</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
                <SegmentedControl<ViewMode>
                    ariaLabel="View mode"
                    value={view}
                    onValueChange={setView}
                    options={[
                        { value: "list", label: "List" },
                        { value: "table", label: "Table" },
                        { value: "board", label: "Board" },
                    ]}
                />
            </div>

            {view === "table" &&
                (filteredTasks.length === 0 ? (
                    <EmptyState
                        icon={CheckSquare}
                        title="No tasks found"
                        description="Try adjusting your filters or create a new task"
                    />
                ) : (
                    <DataTable
                        data={filteredTasks}
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
                ))}

            {view === "board" && (
                <DataBoard
                    data={filteredTasks}
                    columns={boardColumns}
                    keyField="id"
                    cardFields={boardCardFields}
                    cardTitle="title"
                    columnWidth={280}
                    emptyState={
                        <EmptyState
                            icon={CheckSquare}
                            title="No tasks found"
                            description="Try adjusting your filters or create a new task"
                        />
                    }
                />
            )}

            {view === "list" &&
                (filteredTasks.length === 0 ? (
                    <EmptyState
                        icon={CheckSquare}
                        title="No tasks found"
                        description="Try adjusting your filters or create a new task"
                    />
                ) : (
                    <div className="spatial-card overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Task
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Priority
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                                        Fab Status
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                                        Material Cost
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                                        Due Date
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground hidden xl:table-cell">
                                        Dependencies
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map((task) => {
                                    const project = projects.find((p) => p.id === task.projectId);
                                    return (
                                        <tr
                                            key={task.id}
                                            className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                                        >
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {task.title}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {project?.name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        TASK_STATUS_CONFIG[task.status].variant
                                                    }
                                                    className="text-[10px]"
                                                >
                                                    {TASK_STATUS_CONFIG[task.status].label}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        TASK_PRIORITY_CONFIG[task.priority].variant
                                                    }
                                                    className="text-[10px]"
                                                >
                                                    {TASK_PRIORITY_CONFIG[task.priority].label}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                {task.fabricationStatus ? (
                                                    <span className="text-xs font-medium">
                                                        {
                                                            FABRICATION_STATUS_CONFIG[
                                                                task.fabricationStatus
                                                            ].label
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-xs font-medium">
                                                    {task.materialCost
                                                        ? formatCurrency(task.materialCost)
                                                        : "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-xs text-muted-foreground">
                                                    {task.dueDate ? formatDate(task.dueDate) : "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden xl:table-cell">
                                                <span className="text-[10px] text-muted-foreground">
                                                    {task.dependencies.length > 0
                                                        ? `${task.dependencies.length} deps`
                                                        : "none"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export function TasksPageClient() {
    const { data: sbTasks, isLoading: loadingTasks } = useTasks();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();

    const allTasks: Task[] = useMemo(
        () =>
            (sbTasks ?? []).map((t) => ({
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
                dependencies:
                    (
                        t as { task_dependencies?: { depends_on_id: string }[] }
                    ).task_dependencies?.map((d: { depends_on_id: string }) => d.depends_on_id) ||
                    [],
                createdAt: t.created_at ?? new Date().toISOString(),
            })),
        [sbTasks]
    );

    const projects: Project[] = useMemo(
        () =>
            (sbProjects ?? []).map((p) => ({
                id: p.id,
                name: p.name,
                client: p.companies?.name ?? "",
                clientLogo: p.client_logo ?? undefined,
                status: p.status as ProjectStatus,
                currentPhase: p.current_phase as ProjectPhase,
                startDate: p.start_date,
                endDate: p.end_date,
                budgetPlanned: p.budget_planned,
                budgetActual: p.budget_actual,
                progress: p.progress,
                managerId: p.manager_id ?? "",
                teamIds: [],
                createdAt: p.created_at ?? new Date().toISOString(),
            })),
        [sbProjects]
    );

    const isLoading = loadingTasks || loadingProjects;

    const config: ListPageConfig = useMemo(
        () => ({
            ...TASKS_PAGE,
            title: "Tasks",
            createLabel: "New Task",
            exportable: true,
            importable: true,
            stats: [
                {
                    label: "In Progress",
                    icon: CheckSquare,
                    filter: (r) => r.status === "in_progress",
                },
                { label: "To Do", icon: CheckSquare, filter: (r) => r.status === "todo" },
                { label: "Done", icon: CheckSquare, filter: (r) => r.status === "done" },
                {
                    label: "High Priority",
                    icon: CheckSquare,
                    filter: (r) => r.priority === "high" || r.priority === "urgent",
                },
            ],
            filters: [
                {
                    id: "status",
                    label: "Status",
                    column: "status",
                    options: Object.entries(TASK_STATUS_CONFIG).map(([value, cfg]) => ({
                        value,
                        label: cfg.label,
                    })),
                },
                {
                    id: "priority",
                    label: "Priority",
                    column: "priority",
                    options: Object.entries(TASK_PRIORITY_CONFIG).map(([value, cfg]) => ({
                        value,
                        label: cfg.label,
                    })),
                },
            ],
            contentSlot: <TasksContent tasks={allTasks} projects={projects} />,
        }),
        [allTasks, projects]
    );

    return (
        <ListPageShell
            config={config}
            data={allTasks as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
