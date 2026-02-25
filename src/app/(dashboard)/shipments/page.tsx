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
import { useShipments, useLocations, useProjects, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { MOCK_SHIPMENTS, MOCK_LOCATIONS } from "@/lib/mock-data-production";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import type { Project, ProjectStatus, ProjectPhase } from "@/types";
import { SHIPMENT_STATUS_CONFIG, SHIPMENT_TYPE_CONFIG } from "@/config/production-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Plus,
    Truck,
    Package,
    MapPin,
    Calendar,
    ChevronRight,
    ArrowRight,
    Loader2,
} from "lucide-react";

export default function ShipmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbShipments, isLoading: loadingShipments } = useShipments();
    const { data: sbLocations, isLoading: loadingLocations } = useLocations();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();

    const shipments = isSupabaseConfigured && sbShipments ? sbShipments.map(s => ({
        id: s.id,
        projectId: s.project_id,
        number: s.number,
        description: s.description ?? '',
        type: s.type,
        status: s.status,
        priority: s.priority,
        carrierName: s.carrier_name ?? 'Unknown',
        originLocationId: s.origin_location_id ?? undefined,
        destinationLocationId: s.destination_location_id ?? undefined,
        originAddress: (s as unknown as { origin_address?: { city?: string } }).origin_address,
        destinationAddress: (s as unknown as { destination_address?: { city?: string } }).destination_address,
        pickupDate: s.pickup_date,
        totalPieces: s.total_pieces ?? 0,
        cost: s.cost ?? undefined,
    })) : MOCK_SHIPMENTS;

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

    const isLoading = isSupabaseConfigured && (loadingShipments || loadingLocations || loadingProjects);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filteredShipments = shipments.filter((shipment) => {
        const matchesSearch = shipment.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statuses = ["all", "planning", "booked", "in_transit", "delivered"];

    return (
        <PageShell
            title="Shipments"
            description="Track and manage logistics and freight"
            actions={
                <Link href="/shipments/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        New Shipment
                    </Button>
                </Link>
            }
        >
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search shipments..." className="flex-1 max-w-sm" />
                <div className="flex gap-2">
                    {statuses.map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className="capitalize"
                        >
                            {status.replace("_", " ")}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Shipments" value={shipments.length} icon={Truck} />
                <StatCard title="In Transit" value={shipments.filter((s) => s.status === "in_transit" || s.status === "picked_up").length} icon={Truck} />
                <StatCard title="Total Pieces" value={shipments.reduce((sum, s) => sum + (s.totalPieces || 0), 0)} icon={Package} />
                <StatCard title="Total Cost" value={formatCurrency(shipments.reduce((sum, s) => sum + (s.cost || 0), 0))} icon={Truck} />
            </div>

            {/* Shipments List */}
            {filteredShipments.length === 0 ? (
                <EmptyState
                    icon={Truck}
                    title="No shipments found"
                    description={searchQuery ? "Try adjusting your search" : "Create your first shipment"}
                    action={!searchQuery ? { label: "New Shipment", onClick: () => {} } : undefined}
                />
            ) : (
                <div className="space-y-3">
                    {filteredShipments.map((shipment) => {
                        const statusConfig = SHIPMENT_STATUS_CONFIG[shipment.status as keyof typeof SHIPMENT_STATUS_CONFIG];
                        const typeConfig = SHIPMENT_TYPE_CONFIG[shipment.type as keyof typeof SHIPMENT_TYPE_CONFIG];
                        const originLocation = locations.find((l) => l.id === shipment.originLocationId);
                        const destLocation = locations.find((l) => l.id === shipment.destinationLocationId);
                        const project = projects.find((p) => p.id === shipment.projectId);

                        return (
                            <Link key={shipment.id} href={`/shipments/${shipment.id}`}>
                                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                                    <CardContent className="flex items-center gap-4 py-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Truck className="h-6 w-6 text-primary" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{shipment.number}</h3>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {typeConfig?.label || shipment.type}
                                                </Badge>
                                                <Badge variant={statusConfig?.variant as "secondary" | "success" | "warning" | "info" | "destructive" || "secondary"} className="text-[10px]">
                                                    {statusConfig?.label || shipment.status}
                                                </Badge>
                                                {shipment.priority !== "standard" && (
                                                    <Badge variant="destructive" className="text-[10px]">
                                                        {shipment.priority}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mb-1">
                                                {shipment.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {project && (
                                                    <EntityLink
                                                        entityType="project"
                                                        entityId={project.id}
                                                        entityName={project.name}
                                                        size="sm"
                                                        showIcon={false}
                                                    />
                                                )}
                                                <span>• {shipment.carrierName}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="text-right">
                                                <p className="text-muted-foreground">From</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {originLocation?.name || shipment.originAddress?.city || "Origin"}
                                                </p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground">To</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {destLocation?.name || shipment.destinationAddress?.city || "Destination"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="text-muted-foreground text-xs">Pickup</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(shipment.pickupDate)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-muted-foreground text-xs">Pieces</p>
                                                <p className="font-medium">{shipment.totalPieces}</p>
                                            </div>
                                            {shipment.cost && (
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">Cost</p>
                                                    <p className="font-medium">{formatCurrency(shipment.cost)}</p>
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
