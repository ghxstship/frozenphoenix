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
import { useLocations, useProjects, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { MOCK_LOCATIONS } from "@/lib/demo-data-production";
import { MOCK_PROJECTS } from "@/lib/demo-data";
import type { Project, ProjectStatus, ProjectPhase } from "@/types";
import { LOCATION_TYPE_CONFIG } from "@/config/production-config";
import { formatCurrency } from "@/lib/utils";
import {
    Plus,
    MapPin,
    Building,
    Warehouse,
    DollarSign,
    ChevronRight,
    Loader2,
} from "lucide-react";

export default function LocationsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const { data: sbLocations, isLoading: loadingLocations } = useLocations();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();

    const locations = isSupabaseConfigured && sbLocations ? sbLocations.map(l => ({
        id: l.id,
        projectId: l.project_id,
        name: l.name,
        type: l.type,
        address: (l as unknown as { address?: { street?: string; city?: string; state?: string; zip?: string; country?: string } }).address,
        capacity: l.capacity ?? undefined,
        squareFootage: l.square_footage ?? undefined,
        dailyRate: l.daily_rate ?? undefined,
        totalCost: l.total_cost ?? undefined,
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

    const isLoading = isSupabaseConfigured && (loadingLocations || loadingProjects);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filteredLocations = locations.filter((location) => {
        const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            location.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || location.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const locationTypes = Object.entries(LOCATION_TYPE_CONFIG);

    return (
        <PageShell
            title="Locations"
            description="Manage venues, warehouses, and project locations"
            actions={
                <Link href="/locations/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        Add Location
                    </Button>
                </Link>
            }
        >
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search locations..." className="flex-1 max-w-sm" />
                <div className="flex gap-2">
                    <Button
                        variant={typeFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTypeFilter("all")}
                    >
                        All
                    </Button>
                    {locationTypes.slice(0, 4).map(([key, config]) => (
                        <Button
                            key={key}
                            variant={typeFilter === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTypeFilter(key)}
                        >
                            {config.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Locations" value={locations.length} icon={MapPin} />
                <StatCard title="Venues" value={locations.filter((l) => l.type === "venue").length} icon={Building} />
                <StatCard title="Warehouses" value={locations.filter((l) => l.type === "warehouse").length} icon={Warehouse} />
                <StatCard title="Total Cost" value={formatCurrency(locations.reduce((sum, l) => sum + (l.totalCost || 0), 0))} icon={DollarSign} />
            </div>

            {/* Locations List */}
            {filteredLocations.length === 0 ? (
                <EmptyState
                    icon={MapPin}
                    title="No locations found"
                    description={searchQuery ? "Try adjusting your search" : "Add your first location to get started"}
                    action={!searchQuery ? { label: "Add Location", onClick: () => {} } : undefined}
                />
            ) : (
                <div className="space-y-3">
                    {filteredLocations.map((location) => {
                        const typeConfig = LOCATION_TYPE_CONFIG[location.type as keyof typeof LOCATION_TYPE_CONFIG];
                        const Icon = typeConfig?.icon || MapPin;
                        const project = projects.find((p) => p.id === location.projectId);

                        return (
                            <Link key={location.id} href={`/locations/${location.id}`}>
                                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                                    <CardContent className="flex items-center gap-4 py-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold truncate">{location.name}</h3>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {typeConfig?.label || location.type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                {location.address && (
                                                    <span>{location.address.city}, {location.address.state}</span>
                                                )}
                                                {project && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="text-primary">{project.name}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            {location.capacity && (
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">Capacity</p>
                                                    <p className="font-medium">{location.capacity.toLocaleString()}</p>
                                                </div>
                                            )}
                                            {location.squareFootage && (
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">Sq Ft</p>
                                                    <p className="font-medium">{location.squareFootage.toLocaleString()}</p>
                                                </div>
                                            )}
                                            {location.dailyRate && (
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">Daily Rate</p>
                                                    <p className="font-medium">{formatCurrency(location.dailyRate)}</p>
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
    );
}
