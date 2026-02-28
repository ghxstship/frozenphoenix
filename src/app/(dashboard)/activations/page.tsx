"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layouts/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/layouts/empty-state";
import { EntityLink } from "@/components/linked-records";
import { useActivations, useLocations, useProjects, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { PermissionGate } from "@/components/permission-guard";
import { MOCK_ACTIVATIONS, MOCK_LOCATIONS } from "@/lib/demo-data-production";
import { MOCK_PROJECTS } from "@/lib/demo-data";
import type { Project, ProjectStatus, ProjectPhase } from "@/types";
import { ACTIVATION_TYPE_CONFIG } from "@/config/production-config";
import { getStatusLabel } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import {
    Plus,
    Sparkles,
    MapPin,
    Users,
    DollarSign,
    ChevronRight,
    Loader2,
} from "lucide-react";

const STATUS_VARIANTS: Record<string, string> = {
    planning: "secondary",
    design: "info",
    build: "warning",
    installed: "success",
    active: "success",
    struck: "secondary",
    stored: "secondary",
};

export default function ActivationsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbActivations, isLoading: loadingActivations } = useActivations();
    const { data: sbLocations, isLoading: loadingLocations } = useLocations();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();

    const activations = isSupabaseConfigured && sbActivations ? sbActivations.map(a => ({
        id: a.id,
        projectId: a.project_id,
        locationId: a.location_id ?? undefined,
        name: a.name,
        type: a.type,
        status: a.status,
        zone: a.zone ?? undefined,
        dimensions: (a as unknown as { dimensions?: { width?: number; depth?: number; height?: number; unit?: string } }).dimensions,
        expectedFootfall: a.expected_footfall ?? undefined,
        budget: a.budget ?? undefined,
    })) : MOCK_ACTIVATIONS;

    const locations = isSupabaseConfigured && sbLocations ? sbLocations.map(l => ({
        id: l.id,
        name: l.name,
    })) : MOCK_LOCATIONS;

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

    const isLoading = isSupabaseConfigured && (loadingActivations || loadingLocations || loadingProjects);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filteredActivations = activations.filter((activation) => {
        const matchesSearch = activation.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || activation.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statuses = ["all", "planning", "design", "build", "installed", "active"];

    return (
        <PermissionGate resource="activations" action="read">
        <PageShell
            title="Activations"
            description="Manage brand activations, installations, and experiences"
            actions={
                <Link href="/activations/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        New Activation
                    </Button>
                </Link>
            }
        >
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search activations..." className="flex-1 max-w-sm" />
                <div className="flex gap-2">
                    {statuses.map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === "all" ? "All" : getStatusLabel(status)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Activations" value={activations.length} icon={Sparkles} />
                <StatCard title="Active" value={activations.filter((a) => a.status === "active" || a.status === "installed").length} icon={Sparkles} />
                <StatCard title="Expected Footfall" value={activations.reduce((sum, a) => sum + (a.expectedFootfall || 0), 0).toLocaleString()} icon={Users} />
                <StatCard title="Total Budget" value={formatCurrency(activations.reduce((sum, a) => sum + (a.budget || 0), 0))} icon={DollarSign} />
            </div>

            {/* Activations List */}
            {filteredActivations.length === 0 ? (
                <EmptyState
                    icon={Sparkles}
                    title="No activations found"
                    description={searchQuery ? "Try adjusting your search" : "Create your first activation"}
                    action={!searchQuery ? { label: "New Activation", onClick: () => {} } : undefined}
                />
            ) : (
                <div className="space-y-3">
                    {filteredActivations.map((activation) => {
                        const typeConfig = ACTIVATION_TYPE_CONFIG[activation.type as keyof typeof ACTIVATION_TYPE_CONFIG];
                        const location = locations.find((l) => l.id === activation.locationId);
                        const project = projects.find((p) => p.id === activation.projectId);
                        const statusVariant = STATUS_VARIANTS[activation.status] || "secondary";

                        return (
                            <Link key={activation.id} href={`/activations/${activation.id}`}>
                                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                                    <CardContent className="flex items-center gap-4 py-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                                            <Sparkles className="h-6 w-6 text-primary-foreground" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold truncate">{activation.name}</h3>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {typeConfig?.label || activation.type}
                                                </Badge>
                                                <Badge variant={statusVariant as "secondary" | "success" | "warning" | "info"} className="text-[10px]">
                                                    {activation.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                {project && (
                                                    <EntityLink
                                                        entityType="project"
                                                        entityId={project.id}
                                                        entityName={project.name}
                                                        size="sm"
                                                        showIcon={false}
                                                    />
                                                )}
                                                {location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {location.name}
                                                    </span>
                                                )}
                                                {activation.zone && (
                                                    <span>Zone: {activation.zone}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            {activation.dimensions && (
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">Size</p>
                                                    <p className="font-medium">
                                                        {activation.dimensions.width}x{activation.dimensions.depth} {activation.dimensions.unit}
                                                    </p>
                                                </div>
                                            )}
                                            {activation.expectedFootfall && (
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">Footfall</p>
                                                    <p className="font-medium">{activation.expectedFootfall.toLocaleString()}</p>
                                                </div>
                                            )}
                                            {activation.budget && (
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">Budget</p>
                                                    <p className="font-medium">{formatCurrency(activation.budget)}</p>
                                                </div>
                                            )}
                                        </div>

                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </PageShell>
        </PermissionGate>
    );
}
