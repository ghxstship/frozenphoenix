"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDecks, useProjects, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import type { Project, ProjectStatus, ProjectPhase } from "@/types";
import { formatDate } from "@/lib/utils";
import { getStatusVariant, getStatusLabel } from "@/config/ui-variants";
import { StaggerItem } from "@/components/ui/stagger-container";
import type { BadgeVariant } from "@/config/ui-variants";
import {
    Plus,
    Presentation,
    Play,
    Download,
    ExternalLink,
    LayoutGrid,
    List,
    Clock,
    CheckCircle2,
    FileText,
    Loader2,
} from "lucide-react";

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

const MOCK_DECKS: Deck[] = [
    { id: "dk1", projectId: "p1", type: "progress", title: "Coachella Week 8 Update", status: "ready", slideCount: 12, lastUpdated: "2026-02-22" },
    { id: "dk2", projectId: "p1", type: "pitch", title: "Coachella Initial Proposal", status: "presented", slideCount: 24, lastUpdated: "2025-11-15", presentedAt: "2025-11-20" },
    { id: "dk3", projectId: "p2", type: "progress", title: "Glossier Pop-Up Status", status: "draft", slideCount: 8, lastUpdated: "2026-02-20" },
    { id: "dk4", projectId: "p3", type: "pitch", title: "Nike SXSW Concept Deck", status: "draft", slideCount: 18, lastUpdated: "2026-02-18" },
];

const typeConfig: Record<DeckType, { label: string; color: string }> = {
    pitch: { label: "Pitch Deck", color: "bg-primary" },
    progress: { label: "Progress Update", color: "bg-info" },
    wrap: { label: "Wrap Report", color: "bg-success" },
};


export default function DecksPage() {
    const [view, setView] = useState<"grid" | "list">("grid");
    const [filterProject, setFilterProject] = useState<string>("all");
    const [filterType, setFilterType] = useState<DeckType | "all">("all");

    const { data: sbDecks, isLoading: loadingDecks } = useDecks();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();

    const decks: Deck[] = isSupabaseConfigured && sbDecks ? sbDecks.map(d => ({
        id: d.id,
        projectId: d.project_id,
        type: d.type as DeckType,
        title: d.title,
        status: d.status as DeckStatus,
        slideCount: ((d as unknown as { deck_slides?: unknown[] }).deck_slides || []).length,
        lastUpdated: (d.updated_at ?? new Date().toISOString()).split('T')[0],
        presentedAt: (d as unknown as { presented_at?: string }).presented_at?.split('T')[0],
    })) : MOCK_DECKS;

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

    const isLoading = isSupabaseConfigured && (loadingDecks || loadingProjects);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filteredDecks = decks.filter((deck) => {
        if (filterProject !== "all" && deck.projectId !== filterProject) return false;
        if (filterType !== "all" && deck.type !== filterType) return false;
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Presentation Decks" description="Auto-generated pitch, progress, and wrap decks with live data binding">
                <div className="flex items-center gap-2">
                    <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                    >
                        <option value="all">All Projects</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
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
                    <div className="flex rounded-lg border border-input overflow-hidden">
                        <button
                            onClick={() => setView("grid")}
                            className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                        >
                            <List className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <Button size="sm">
                        <Plus className="h-4 w-4" />
                        New Deck
                    </Button>
                </div>
            </PageHeader>

            <div className="flex items-center gap-4">
                {(Object.entries(typeConfig) as [DeckType, typeof typeConfig[DeckType]][]).map(([type, config]) => {
                    const count = MOCK_DECKS.filter((d) => d.type === type).length;
                    return (
                        <div key={type} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-xs">
                            <div className={`h-2 w-2 rounded-full ${config.color}`} />
                            <span className="font-medium">{config.label}</span>
                            <span className="text-muted-foreground">({count})</span>
                        </div>
                    );
                })}
            </div>

            {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDecks.map((deck, i) => {
                        const project = MOCK_PROJECTS.find((p) => p.id === deck.projectId);
                        const type = typeConfig[deck.type];
                        return (
                            <StaggerItem key={deck.id} index={i} stagger="relaxed">
                            <Card
                                className="group cursor-pointer hover:border-primary/30 overflow-hidden"
                            >
                                <div className={`h-32 ${type.color} relative`}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Presentation className="h-12 w-12 text-white/30" />
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <Badge variant="secondary" className="text-[9px] bg-white/20 text-white border-0">
                                            {type.label}
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                                            <Play className="h-4 w-4 text-white" />
                                        </button>
                                        <button className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                                            <Download className="h-4 w-4 text-white" />
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
                                        <Badge variant={getStatusVariant(deck.status) as BadgeVariant} className="text-[9px] shrink-0">
                                            {getStatusLabel(deck.status)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
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
                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-success">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Presented {formatDate(deck.presentedAt)}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            </StaggerItem>
                        );
                    })}

                    <Card className="border-dashed border-2 flex items-center justify-center min-h-[280px] cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors">
                        <div className="text-center">
                            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                                <Plus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">Create New Deck</p>
                            <p className="text-xs text-muted-foreground mt-1">Auto-populate with project data</p>
                        </div>
                    </Card>
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Deck</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Project</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Type</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Slides</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Updated</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDecks.map((deck) => {
                                    const project = MOCK_PROJECTS.find((p) => p.id === deck.projectId);
                                    const type = typeConfig[deck.type];
                                    return (
                                        <tr
                                            key={deck.id}
                                            className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-8 w-8 rounded-lg ${type.color} flex items-center justify-center`}>
                                                        <Presentation className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium">{deck.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">{project?.name}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="ghost" className="text-[10px]">{type.label}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={getStatusVariant(deck.status) as BadgeVariant} className="text-[10px]">{getStatusLabel(deck.status)}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-xs">{deck.slideCount}</td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(deck.lastUpdated)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                                                        <Play className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                                                        <Download className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
