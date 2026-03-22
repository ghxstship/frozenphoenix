"use client";

import React, { useMemo, useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DECKS_PAGE } from "@/config/list-page-configs/primary";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDecks, useProjects } from "@/lib/supabase";
import { useCreateDeck } from "@/lib/supabase/hooks-documents";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_DECK_CONFIG } from "@/config/create-entity-configs";
import type { Project, ProjectPhase, ProjectStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { StaggerItem } from "@/components/ui/stagger-container";
import type { BadgeVariant } from "@/config/ui-variants";
import {
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Play,
    Plus,
    Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { ListPageShell } from "@/components/shells/list-page-shell";
import type { ListPageConfig } from "@/types/list-page-config";

type DeckType = "pitch" | "progress" | "wrap";
type DeckStatus = "draft" | "ready" | "presented";

interface Deck {
    id: string;
    projectId: string;
    type: DeckType;
    title: string;
    status: DeckStatus;
    slideCount: number;
    lastUpdated: string;
    presentedAt?: string;
}

const typeConfig: Record<DeckType, { label: string; color: string }> = {
    pitch: { label: "Pitch Deck", color: "bg-primary" },
    progress: { label: "Progress Update", color: "bg-info" },
    wrap: { label: "Wrap Report", color: "bg-success" },
};

// ─── Deck Card ───────────────────────────────────────────────
function DeckCard({ deck, project }: { deck: Deck; project: Project | undefined }) {
    const { addToast } = useToast();
    const type = typeConfig[deck.type];

    return (
        <Card className="group cursor-pointer hover:border-primary/30 overflow-hidden">
            <div className={`h-32 ${type.color} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Presentation className="h-12 w-12 text-primary-foreground/30" />
                </div>
                <div className="absolute top-3 left-3">
                    <Badge
                        variant="secondary"
                        className="density-caption bg-foreground/20 text-primary-foreground border-0"
                    >
                        {type.label}
                    </Badge>
                </div>
                <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="h-8 w-8 rounded-lg bg-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-foreground/30 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            addToast({
                                title: "Presenting deck",
                                description: deck.title,
                                variant: "default",
                            });
                        }}
                    >
                        <Play className="h-4 w-4 text-primary-foreground" />
                    </button>
                    <button
                        className="h-8 w-8 rounded-lg bg-foreground/20 backdrop-blur-sm flex items-center justify-center hover:bg-foreground/30 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            addToast({
                                title: "Download started",
                                description: deck.title,
                                variant: "default",
                            });
                        }}
                    >
                        <Download className="h-4 w-4 text-primary-foreground" />
                    </button>
                </div>
            </div>
            <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                            {deck.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">{project?.name}</p>
                    </div>
                    <Badge
                        variant={getStatusVariant(deck.status) as BadgeVariant}
                        className="density-caption shrink-0"
                    >
                        {getStatusLabel(deck.status)}
                    </Badge>
                </div>
                <div className="flex items-center justify-between density-caption text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {deck.slideCount} slides
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(deck.lastUpdated)}
                    </span>
                </div>
                {deck.presentedAt && (
                    <div className="mt-2 flex items-center gap-1 density-caption text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Presented {formatDate(deck.presentedAt)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Content Component ──────────────────────────────────────
function DecksContent({ decks, projects }: { decks: Deck[]; projects: Project[] }) {
    const { addToast } = useToast();
    const VIEW_MODES = ["grid", "list"] as const;
    const [view, setView] = useQueryTabState({
        key: "view",
        defaultValue: "grid",
        validValues: VIEW_MODES,
    });
    const [filterProject, setFilterProject] = useState<string>("all");
    const [filterType, setFilterType] = useState<DeckType | "all">("all");

    const filteredDecks = decks.filter((deck) => {
        if (filterProject !== "all" && deck.projectId !== filterProject) return false;
        if (filterType !== "all" && deck.type !== filterType) return false;
        return true;
    });

    return (
        <>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
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
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as DeckType | "all")}
                        className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                    >
                        <option value="all">All Types</option>
                        <option value="pitch">Pitch</option>
                        <option value="progress">Progress</option>
                        <option value="wrap">Wrap</option>
                    </select>
                </div>
                <SegmentedControl
                    value={view}
                    onValueChange={(v) => setView(v as "grid" | "list")}
                    options={[
                        { value: "grid", label: "Grid" },
                        { value: "list", label: "List" },
                    ]}
                    ariaLabel="View mode"
                />
            </div>

            {/* Type Legend */}
            <div className="flex items-center gap-4">
                {(Object.entries(typeConfig) as [DeckType, (typeof typeConfig)[DeckType]][]).map(
                    ([type, cfg]) => {
                        const count = decks.filter((d) => d.type === type).length;
                        return (
                            <div
                                key={type}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-xs"
                            >
                                <div className={`h-2 w-2 rounded-full ${cfg.color}`} />
                                <span className="font-medium">{cfg.label}</span>
                                <span className="text-muted-foreground">({count})</span>
                            </div>
                        );
                    }
                )}
            </div>

            {view === "grid" ? (
                filteredDecks.length === 0 ? (
                    <EmptyState
                        icon={Presentation}
                        title="No decks found"
                        description="Create your first presentation deck"
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 density-gap-card">
                        {filteredDecks.map((deck, i) => {
                            const project = projects.find((p) => p.id === deck.projectId);
                            return (
                                <StaggerItem key={deck.id} index={i} stagger="relaxed">
                                    <DeckCard deck={deck} project={project} />
                                </StaggerItem>
                            );
                        })}
                    </div>
                )
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Deck
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Project
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Slides
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Updated
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDecks.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-0">
                                            <EmptyState
                                                icon={Presentation}
                                                title="No decks found"
                                                description="Create your first presentation deck"
                                                compact
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDecks.map((deck) => {
                                        const project = projects.find(
                                            (p) => p.id === deck.projectId
                                        );
                                        const type = typeConfig[deck.type];
                                        return (
                                            <tr
                                                key={deck.id}
                                                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`h-8 w-8 rounded-lg ${type.color} flex items-center justify-center`}
                                                        >
                                                            <Presentation className="h-4 w-4 text-primary-foreground" />
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            {deck.title}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {project?.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="ghost"
                                                        className="density-caption"
                                                    >
                                                        {type.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={
                                                            getStatusVariant(
                                                                deck.status
                                                            ) as BadgeVariant
                                                        }
                                                        className="density-caption"
                                                    >
                                                        {getStatusLabel(deck.status)}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    {deck.slideCount}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {formatDate(deck.lastUpdated)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                                                            onClick={() =>
                                                                addToast({
                                                                    title: "Presenting deck",
                                                                    description: deck.title,
                                                                    variant: "default",
                                                                })
                                                            }
                                                        >
                                                            <Play className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                                                            onClick={() =>
                                                                addToast({
                                                                    title: "Download started",
                                                                    description: deck.title,
                                                                    variant: "default",
                                                                })
                                                            }
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                                                            onClick={() =>
                                                                addToast({
                                                                    title: "Opening deck",
                                                                    description: deck.title,
                                                                    variant: "default",
                                                                })
                                                            }
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export function DecksPageClient() {
    const createDeck = useCreateDeck();
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const { data: sbDecks, isLoading: loadingDecks } = useDecks();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();

    const decks: Deck[] = useMemo(
        () =>
            (sbDecks ?? []).map((d) => ({
                id: d.id,
                projectId: d.project_id,
                type: d.type as DeckType,
                title: d.title,
                status: d.status as DeckStatus,
                slideCount: ((d as unknown as { deck_slides?: unknown[] }).deck_slides || [])
                    .length,
                lastUpdated: (d.updated_at ?? new Date().toISOString()).split("T")[0] ?? "",
                presentedAt:
                    (d as unknown as { presented_at?: string }).presented_at?.split("T")[0] ??
                    undefined,
            })),
        [sbDecks]
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

    const isLoading = loadingDecks || loadingProjects;

    const config: ListPageConfig = useMemo(
        () => ({
            ...DECKS_PAGE,
            title: "Presentation Decks",
            createLabel: "New Deck",
            stats: [
                {
                    label: "Pitch Decks",
                    icon: Presentation,
                    compute: () => decks.filter((d) => d.type === "pitch").length,
                },
                {
                    label: "Progress Updates",
                    icon: Presentation,
                    compute: () => decks.filter((d) => d.type === "progress").length,
                },
                {
                    label: "Wrap Reports",
                    icon: Presentation,
                    compute: () => decks.filter((d) => d.type === "wrap").length,
                },
                {
                    label: "Presented",
                    icon: CheckCircle2,
                    compute: () => decks.filter((d) => d.status === "presented").length,
                },
            ],
            contentSlot: (
                <>
                    <DecksContent decks={decks} projects={projects} />
                    <CreateEntityDialog
                        config={CREATE_DECK_CONFIG}
                        open={createOpen}
                        onClose={closeCreate}
                        onSubmit={async (values) => {
                            await createDeck.mutateAsync(
                                values as Parameters<typeof createDeck.mutateAsync>[0]
                            );
                        }}
                    />
                </>
            ),
            headerActions: (
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> New Deck
                </Button>
            ),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [decks, projects, createOpen]
    );

    return (
        <ListPageShell
            config={config}
            data={decks as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
