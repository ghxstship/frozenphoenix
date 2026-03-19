"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, User } from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { useCrewMembers, useProjects, useUpdateCrewMember } from "@/lib/supabase";
import { LoadingState } from "@/components/layouts/loading-state";

// ─── Types ───

interface CrewRow {
    id: string;
    name: string;
    role: string;
    supervisor_id: string | null;
}

interface TreeNode {
    crew: CrewRow;
    children: TreeNode[];
}

// ─── Tree Builder ───

function buildTree(rows: CrewRow[]): TreeNode[] {
    const byId = new Map(rows.map((r) => [r.id, r]));
    const childrenMap = new Map<string | null, CrewRow[]>();
    for (const r of rows) {
        const parentKey = r.supervisor_id && byId.has(r.supervisor_id) ? r.supervisor_id : null;
        const siblings = childrenMap.get(parentKey) ?? [];
        siblings.push(r);
        childrenMap.set(parentKey, siblings);
    }

    function build(parentId: string | null): TreeNode[] {
        return (childrenMap.get(parentId) ?? []).map((crew) => ({
            crew,
            children: build(crew.id),
        }));
    }

    return build(null);
}

// ─── Draggable + Droppable Node Card ───

function OrgNodeCard({
    node,
    depth,
    isDragOverlay,
}: {
    node: TreeNode;
    depth: number;
    isDragOverlay?: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        isDragging,
    } = useDraggable({
        id: node.crew.id,
    });
    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: node.crew.id });

    const isRoot = depth === 0;

    return (
        <div className="flex flex-col items-center">
            <div
                ref={(el) => {
                    setDragRef(el);
                    setDropRef(el);
                }}
                className={`
                    relative rounded-xl border bg-card p-4 text-center transition-all
                    ${isRoot ? "min-w-48 border-primary/30" : depth === 1 ? "min-w-40" : "min-w-32"}
                    ${isDragging && !isDragOverlay ? "opacity-30" : ""}
                    ${isOver ? "ring-2 ring-primary border-primary bg-primary/5" : ""}
                    ${isDragOverlay ? "shadow-xl ring-2 ring-primary" : ""}
                `}
                {...attributes}
            >
                <div
                    {...listeners}
                    className="absolute top-1.5 right-1.5 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-secondary/50 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    aria-label={`Drag ${node.crew.name} to reorganize`}
                >
                    <GripVertical className="h-3.5 w-3.5" />
                </div>
                <div
                    className={`rounded-full flex items-center justify-center mx-auto mb-2 ${
                        isRoot
                            ? "h-10 w-10 bg-primary/10"
                            : depth === 1
                              ? "h-8 w-8 bg-secondary"
                              : "h-7 w-7 bg-muted"
                    }`}
                >
                    <User
                        className={
                            isRoot
                                ? "h-5 w-5 text-primary"
                                : depth === 1
                                  ? "h-4 w-4 text-foreground"
                                  : "h-3.5 w-3.5 text-muted-foreground"
                        }
                    />
                </div>
                <p
                    className={
                        isRoot
                            ? "text-sm font-bold"
                            : depth === 1
                              ? "text-sm font-semibold"
                              : "text-xs font-medium"
                    }
                >
                    {node.crew.name}
                </p>
                <Badge variant="ghost" className="text-[9px] mt-1">
                    {node.crew.role}
                </Badge>
            </div>

            {/* Children */}
            {node.children.length > 0 && (
                <>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex gap-6 flex-wrap justify-center">
                        {node.children.map((child) => (
                            <OrgNodeCard key={child.crew.id} node={child} depth={depth + 1} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Unassigned Drop Zone ───

function UnassignedZone({ unassigned }: { unassigned: CrewRow[] }) {
    const { setNodeRef, isOver } = useDroppable({ id: "__root__" });

    if (unassigned.length === 0) return null;

    return (
        <Card>
            <CardContent
                ref={setNodeRef}
                className={`py-4 transition-colors ${isOver ? "bg-primary/5 ring-2 ring-primary rounded-xl" : ""}`}
            >
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                    Unassigned ({unassigned.length}) — drag onto a node above to assign
                </p>
                <div className="flex flex-wrap gap-3">
                    {unassigned.map((c) => (
                        <DraggableChip key={c.id} crew={c} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function DraggableChip({ crew }: { crew: CrewRow }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: crew.id });
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-card cursor-grab active:cursor-grabbing text-xs
                hover:border-primary/40 transition-all
                ${isDragging ? "opacity-30" : ""}
            `}
        >
            <GripVertical className="h-3 w-3 text-muted-foreground/40" />
            <span className="font-medium">{crew.name}</span>
            <Badge variant="ghost" className="text-[8px]">
                {crew.role}
            </Badge>
        </div>
    );
}

// ─── Page ───

export function OrgChartPageClient() {
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();
    const { data: sbCrew, isLoading: loadingCrew } = useCrewMembers();
    const updateCrewMember = useUpdateCrewMember();
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    const projects = useMemo(
        () => (sbProjects ?? []) as Array<Record<string, unknown>>,
        [sbProjects]
    );

    const crewRows: CrewRow[] = useMemo(
        () =>
            ((sbCrew ?? []) as Array<Record<string, unknown>>).map((c) => ({
                id: String(c.id),
                name: String(c.name ?? ""),
                role: String(c.role ?? "Team Member"),
                supervisor_id: (c.supervisor_id as string) ?? null,
            })),
        [sbCrew]
    );

    const tree = useMemo(() => buildTree(crewRows), [crewRows]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveDragId(String(event.active.id));
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveDragId(null);
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const draggedId = String(active.id);
            const targetId = String(over.id);
            const newSupervisorId = targetId === "__root__" ? null : targetId;

            // Prevent circular assignment (dragging a parent onto its own descendant)
            function isDescendant(parentId: string, childId: string): boolean {
                const children = crewRows.filter((c) => c.supervisor_id === parentId);
                for (const child of children) {
                    if (child.id === childId || isDescendant(child.id, childId)) return true;
                }
                return false;
            }

            if (newSupervisorId && isDescendant(draggedId, newSupervisorId)) return;

            const current = crewRows.find((c) => c.id === draggedId);
            if (current?.supervisor_id === newSupervisorId) return;

            updateCrewMember.mutate({ id: draggedId, supervisor_id: newSupervisorId });
        },
        [crewRows, updateCrewMember]
    );

    const activeDragCrew = activeDragId ? crewRows.find((c) => c.id === activeDragId) : null;

    if (loadingProjects || loadingCrew) {
        return <LoadingState />;
    }

    // Crew members whose supervisor_id references someone not in the dataset
    const crewIdSet = new Set(crewRows.map((c) => c.id));
    const unassigned = crewRows.filter(
        (c) => c.supervisor_id !== null && !crewIdSet.has(c.supervisor_id)
    );

    return (
        <PermissionGate resource="org_chart" action="read">
            <div className="space-y-6 motion-safe:animate-fade-in">
                <PageHeader
                    title="Org Chart"
                    description="Drag crew members to reorganize the reporting hierarchy"
                >
                    <select className="h-8 rounded-lg border border-input bg-background px-2 text-xs">
                        {projects.map((p) => (
                            <option key={String(p.id)} value={String(p.id)}>
                                {String(p.name ?? "")}
                            </option>
                        ))}
                    </select>
                </PageHeader>
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    {/* Visual Org Chart */}
                    <Card>
                        <CardContent className="py-8 overflow-x-auto">
                            <div className="flex flex-col items-center space-y-2 min-w-fit">
                                {tree.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-8">
                                        No crew members found. Add crew to build your org chart.
                                    </p>
                                ) : (
                                    <div className="flex gap-8 flex-wrap justify-center">
                                        {tree.map((root) => (
                                            <OrgNodeCard key={root.crew.id} node={root} depth={0} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unassigned members */}
                    <UnassignedZone unassigned={unassigned} />

                    {/* Drag overlay */}
                    <DragOverlay dropAnimation={null}>
                        {activeDragCrew ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-card shadow-xl ring-2 ring-primary text-xs">
                                <User className="h-3 w-3 text-primary" />
                                <span className="font-medium">{activeDragCrew.name}</span>
                                <Badge variant="ghost" className="text-[8px]">
                                    {activeDragCrew.role}
                                </Badge>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </PermissionGate>
    );
}
