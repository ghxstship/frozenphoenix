"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layouts/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/layouts/empty-state";
import { EntityLink } from "@/components/linked-records";
import { useEvents, useLocations, useActivations, useProjects, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { MOCK_EVENTS, MOCK_LOCATIONS, MOCK_ACTIVATIONS } from "@/lib/mock-data-production";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import type { Project, ProjectStatus, ProjectPhase } from "@/types";
import { EVENT_TYPE_CONFIG } from "@/config/production-config";
import { formatDate } from "@/lib/utils";
import {
    Plus,
    Search,
    Calendar,
    MapPin,
    Users,
    Clock,
    ChevronRight,
    Play,
    Loader2,
} from "lucide-react";

const STATUS_VARIANTS: Record<string, string> = {
    scheduled: "secondary",
    confirmed: "success",
    in_progress: "warning",
    completed: "info",
    cancelled: "destructive",
    postponed: "warning",
};

export default function EventsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbEvents, isLoading: loadingEvents } = useEvents();
    const { data: sbLocations, isLoading: loadingLocations } = useLocations();
    const { data: sbActivations, isLoading: loadingActivations } = useActivations();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();

    const events = isSupabaseConfigured && sbEvents ? sbEvents.map(e => ({
        id: e.id,
        projectId: e.project_id,
        activationId: e.activation_id ?? undefined,
        locationId: e.location_id ?? undefined,
        name: e.name,
        type: e.type,
        status: e.status,
        date: e.date,
        startTime: e.start_time,
        endTime: e.end_time,
        attendeeCount: e.attendee_count ?? undefined,
        vipCount: e.vip_count ?? undefined,
    })) : MOCK_EVENTS;

    const locations = isSupabaseConfigured && sbLocations ? sbLocations.map(l => ({
        id: l.id,
        name: l.name,
    })) : MOCK_LOCATIONS;

    const activations = isSupabaseConfigured && sbActivations ? sbActivations.map(a => ({
        id: a.id,
        name: a.name,
    })) : MOCK_ACTIVATIONS;

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

    const isLoading = isSupabaseConfigured && (loadingEvents || loadingLocations || loadingActivations || loadingProjects);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filteredEvents = events.filter((event) => {
        const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || event.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statuses = ["all", "scheduled", "confirmed", "in_progress", "completed"];

    return (
        <PageShell
            title="Events"
            description="Manage shows, rehearsals, and scheduled activities"
            actions={
                <Link href="/events/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        Schedule Event
                    </Button>
                </Link>
            }
        >
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
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
                <StatCard title="Total Events" value={events.length} icon={Calendar} />
                <StatCard title="Confirmed" value={events.filter((e) => e.status === "confirmed").length} icon={Play} />
                <StatCard title="Total Attendees" value={events.reduce((sum, e) => sum + (e.attendeeCount || 0), 0).toLocaleString()} icon={Users} />
                <StatCard title="VIP Guests" value={events.reduce((sum, e) => sum + (e.vipCount || 0), 0).toLocaleString()} icon={Users} />
            </div>

            {/* Events List */}
            {filteredEvents.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title="No events found"
                    description={searchQuery ? "Try adjusting your search" : "Schedule your first event"}
                    action={!searchQuery ? { label: "Schedule Event", onClick: () => {} } : undefined}
                />
            ) : (
                <div className="space-y-3">
                    {filteredEvents.map((event) => {
                        const typeConfig = EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG];
                        const location = locations.find((l) => l.id === event.locationId);
                        const activation = event.activationId ? activations.find((a) => a.id === event.activationId) : null;
                        const project = projects.find((p) => p.id === event.projectId);
                        const statusVariant = STATUS_VARIANTS[event.status] || "secondary";
                        const TypeIcon = typeConfig?.icon || Calendar;

                        return (
                            <Link key={event.id} href={`/events/${event.id}`}>
                                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                                    <CardContent className="flex items-center gap-4 py-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <TypeIcon className="h-6 w-6 text-primary" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold truncate">{event.name}</h3>
                                                <Badge variant={typeConfig?.variant as "secondary" | "success" | "warning" | "info" || "secondary"} className="text-[10px]">
                                                    {typeConfig?.label || event.type}
                                                </Badge>
                                                <Badge variant={statusVariant as "secondary" | "success" | "warning" | "info" | "destructive"} className="text-[10px]">
                                                    {event.status.replace("_", " ")}
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
                                                {activation && (
                                                    <span>@ {activation.name}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="text-muted-foreground text-xs">Date</p>
                                                <p className="font-medium">{formatDate(event.date)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-muted-foreground text-xs">Time</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {event.startTime} - {event.endTime}
                                                </p>
                                            </div>
                                            {event.attendeeCount && (
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">Attendees</p>
                                                    <p className="font-medium">{event.attendeeCount.toLocaleString()}</p>
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
