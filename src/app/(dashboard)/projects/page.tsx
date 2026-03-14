"use client";

import React, { useMemo } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { Project, ProjectPhase, ProjectStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useProjects } from "@/lib/supabase/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ArrowRight, Calendar, DollarSign, FolderKanban, Users } from "lucide-react";
import { CREATE_PROJECT_CONFIG } from "@/config/create-entity-configs";
import {
    PROJECT_PHASE_MAP as PROJECT_PHASE_CONFIG,
    PROJECT_PHASE_ORDER,
    PROJECT_STATUS_MAP as PROJECT_STATUS_CONFIG,
} from "@/config/domain-config";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { type BoardColumn, type CardField, DataBoard } from "@/components/data-view/data-board";
import { CurrencyField, DateField } from "@/components/data-view/field-renderers";
import { ListPageShell } from "@/components/shells/list-page-shell";
import type { ListPageConfig } from "@/types/list-page-config";

type ViewMode = "cards" | "table" | "board";

// ─── Table Columns Definition ───
const tableColumns: ColumnDef<Project>[] = [
    {
        id: "name",
        header: "Project",
        accessorKey: "name",
        sticky: true,
        minWidth: 200,
        render: (value, row) => (
            <div>
                <div className="font-medium">{String(value)}</div>
                <div className="text-xs text-muted-foreground">{row.client}</div>
            </div>
        ),
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        fieldType: "status",
        fieldConfig: {
            variantMap: Object.fromEntries(
                Object.entries(PROJECT_STATUS_CONFIG).map(([k, v]) => [k, v.variant])
            ),
            labelMap: Object.fromEntries(
                Object.entries(PROJECT_STATUS_CONFIG).map(([k, v]) => [k, v.label])
            ),
        },
        width: 120,
    },
    {
        id: "phase",
        header: "Phase",
        accessorKey: "currentPhase",
        render: (value) => (
            <Badge variant="secondary" className="text-xs">
                {PROJECT_PHASE_CONFIG[value as ProjectPhase]?.label ?? value}
            </Badge>
        ),
        width: 130,
    },
    {
        id: "progress",
        header: "Progress",
        accessorKey: "progress",
        fieldType: "progress",
        width: 150,
    },
    {
        id: "budget",
        header: "Budget",
        accessorFn: (row) => row.budgetActual,
        render: (_, row) => (
            <div className="text-sm">
                <CurrencyField value={row.budgetActual} compact />
                <span className="text-muted-foreground"> / </span>
                <CurrencyField
                    value={row.budgetPlanned}
                    compact
                    className="text-muted-foreground"
                />
            </div>
        ),
        width: 160,
    },
    {
        id: "dates",
        header: "Timeline",
        accessorKey: "startDate",
        render: (_, row) => (
            <div className="text-xs text-muted-foreground">
                <DateField value={row.startDate} /> — <DateField value={row.endDate} />
            </div>
        ),
        width: 180,
    },
    {
        id: "team",
        header: "Team",
        accessorFn: (row) => row.teamIds.length,
        render: (value) => <span className="text-sm">{String(value)} members</span>,
        width: 100,
        align: "center",
    },
];

// ─── Board Columns Definition ───
const boardColumns: BoardColumn<Project>[] = [
    { id: "draft", title: "Draft", variant: "ghost", filter: (p) => p.status === "draft" },
    { id: "active", title: "Active", variant: "success", filter: (p) => p.status === "active" },
    { id: "on_hold", title: "On Hold", variant: "warning", filter: (p) => p.status === "on_hold" },
    {
        id: "completed",
        title: "Completed",
        variant: "info",
        filter: (p) => p.status === "completed",
    },
];

// ─── Board Card Fields ───
const boardCardFields: CardField<Project>[] = [
    {
        id: "phase",
        position: "header",
        accessorKey: "currentPhase",
        render: (value) => (
            <Badge variant="secondary" className="text-xs">
                {PROJECT_PHASE_CONFIG[value as ProjectPhase]?.label ?? value}
            </Badge>
        ),
    },
    {
        id: "progress",
        label: "Progress",
        accessorKey: "progress",
        fieldType: "progress",
    },
    {
        id: "budget",
        label: "Budget",
        accessorFn: (row) =>
            `${formatCurrency(row.budgetActual)} / ${formatCurrency(row.budgetPlanned)}`,
        position: "footer",
    },
];

// ─── Project Card ────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
    const budgetPercent =
        project.budgetPlanned > 0
            ? Math.round((project.budgetActual / project.budgetPlanned) * 100)
            : 0;
    const isOverBudget = budgetPercent > 90;

    return (
        <Card className="group cursor-pointer hover:border-primary/30">
            <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold truncate group-hover:text-primary transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                    <Badge variant={PROJECT_STATUS_CONFIG[project.status].variant}>
                        {project.status}
                    </Badge>
                </div>

                {/* Phase Progress */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">
                            Phase:{" "}
                            <span className="text-primary">
                                {PROJECT_PHASE_CONFIG[project.currentPhase].label}
                            </span>
                        </span>
                        <span className="text-xs font-bold">{project.progress}%</span>
                    </div>
                    <div className="flex gap-0.5">
                        {PROJECT_PHASE_ORDER.map((phase, idx) => {
                            const currentIdx = PROJECT_PHASE_ORDER.indexOf(project.currentPhase);
                            const isComplete = idx < currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                                <div
                                    key={phase}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                        isComplete
                                            ? "bg-success"
                                            : isCurrent
                                              ? "bg-primary animate-pulse-glow"
                                              : "bg-muted"
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Budget */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Budget
                        </span>
                        <span
                            className={`text-xs font-medium ${isOverBudget ? "text-destructive" : ""}`}
                        >
                            {formatCurrency(project.budgetActual)} /{" "}
                            {formatCurrency(project.budgetPlanned)}
                        </span>
                    </div>
                    <ProgressBar value={Math.min(budgetPercent, 100)} size="xs" />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.startDate)} — {formatDate(project.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.teamIds.length} members
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Content Component ──────────────────────────────────────
function ProjectsContent({ projects }: { projects: Project[] }) {
    const VIEW_MODES = ["cards", "table", "board"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "cards",
        validValues: VIEW_MODES,
    });

    return (
        <>
            <div className="flex justify-end">
                <SegmentedControl<ViewMode>
                    ariaLabel="View mode"
                    value={viewMode}
                    onValueChange={setViewMode}
                    options={[
                        { value: "cards", label: "Cards" },
                        { value: "table", label: "Table" },
                        { value: "board", label: "Board" },
                    ]}
                />
            </div>

            {/* Phase Legend - only show in cards view */}
            {viewMode === "cards" && (
                <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
                    {PROJECT_PHASE_ORDER.map((phase, i) => (
                        <React.Fragment key={phase}>
                            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap px-2 py-1 rounded-md bg-secondary/50">
                                {PROJECT_PHASE_CONFIG[phase].label}
                            </span>
                            {i < PROJECT_PHASE_ORDER.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {viewMode === "table" && (
                <DataTable
                    data={projects}
                    columns={tableColumns}
                    keyField="id"
                    sortable
                    searchable
                    searchPlaceholder="Search projects..."
                    pagination
                    pageSize={10}
                    hoverable
                    stickyHeader
                />
            )}

            {viewMode === "board" && (
                <DataBoard
                    data={projects}
                    columns={boardColumns}
                    keyField="id"
                    cardFields={boardCardFields}
                    cardTitle="name"
                    cardSubtitle="client"
                    columnWidth={320}
                />
            )}

            {viewMode === "cards" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {projects.map((project, i) => (
                        <StaggerItem key={project.id} index={i} stagger="relaxed">
                            <ProjectCard project={project} />
                        </StaggerItem>
                    ))}
                </div>
            )}
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function ProjectsPage() {
    const { data: sbProjects, isLoading } = useProjects();

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
                teamIds:
                    (p as { project_members?: { profile_id: string }[] }).project_members?.map(
                        (m: { profile_id: string }) => m.profile_id
                    ) || [],
                createdAt: p.created_at ?? new Date().toISOString(),
            })),
        [sbProjects]
    );

    const config: ListPageConfig = useMemo(
        () => ({
            entityKey: "projects",
            title: "Productions",
            description: "Manage your active productions and their lifecycle",
            icon: FolderKanban,
            createConfig: CREATE_PROJECT_CONFIG,
            createLabel: "New Project",
            exportable: true,
            importable: true,
            searchKeys: ["name", "client"],
            stats: [
                {
                    label: "Active",
                    icon: FolderKanban,
                    filter: (r) => r.status === "active",
                },
                {
                    label: "Draft",
                    icon: FolderKanban,
                    filter: (r) => r.status === "draft",
                },
                {
                    label: "Total Budget",
                    icon: DollarSign,
                    compute: (r) =>
                        formatCurrency(
                            r.reduce((sum, p) => sum + ((p.budgetPlanned as number) || 0), 0)
                        ),
                },
                {
                    label: "Team Members",
                    icon: Users,
                    compute: (r) => {
                        const ids = new Set<string>();
                        r.forEach((p) => {
                            const teamIds = p.teamIds as string[];
                            teamIds?.forEach((id) => ids.add(id));
                        });
                        return ids.size;
                    },
                },
            ],
            filters: [
                {
                    id: "status",
                    label: "Status",
                    column: "status",
                    options: Object.entries(PROJECT_STATUS_CONFIG).map(([value, cfg]) => ({
                        value,
                        label: cfg.label,
                    })),
                },
            ],
            contentSlot: <ProjectsContent projects={projects} />,
        }),
        [projects]
    );

    return (
        <ListPageShell
            config={config}
            data={projects as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
