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
import { useIncidents, useLocations, useProjects } from "@/lib/supabase/hooks";
import type { Project, ProjectPhase, ProjectStatus } from "@/types";
import {
    INCIDENT_SEVERITY_CONFIG,
    INCIDENT_STATUS_CONFIG,
    INCIDENT_TYPE_CONFIG,
} from "@/config/production-config";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, ChevronRight, Clock, Loader2, MapPin, Plus, Shield } from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

export default function IncidentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbIncidents, isLoading: loadingIncidents } = useIncidents();
    const { data: sbLocations, isLoading: loadingLocations } = useLocations();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();

    const incidents = (sbIncidents ?? []).map((i) => ({
        id: i.id,
        projectId: i.project_id,
        locationId: i.location_id ?? undefined,
        number: i.number,
        title: i.title,
        type: i.type,
        severity: i.severity,
        status: i.status,
        specificLocation: i.specific_location ?? undefined,
        occurredAt: i.occurred_at,
        estimatedCost: i.estimated_cost ?? undefined,
        insuranceClaim: i.insurance_claim ?? false,
    }));

    const locations = (sbLocations ?? []).map((l) => ({
        id: l.id,
        name: l.name,
    }));

    const projects: Project[] = (sbProjects ?? []).map((p) => ({
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
        managerId: p.manager_id ?? "",
        teamIds: [],
        createdAt: p.created_at ?? new Date().toISOString(),
    }));

    const isLoading = loadingIncidents || loadingLocations || loadingProjects;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filteredIncidents = incidents.filter((incident) => {
        const matchesSearch =
            incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statuses = ["all", "reported", "investigating", "pending_action", "resolved", "closed"];

    const openIncidents = incidents.filter((i) => i.status !== "closed" && i.status !== "resolved");
    const criticalIncidents = incidents.filter(
        (i) => i.severity === "critical" || i.severity === "major"
    );

    return (
        <PermissionGate resource="incidents" action="read">
            <PageShell
                title="Incidents"
                description="Track and manage safety incidents, issues, and resolutions"
                actions={
                    <Link href="/incidents/new">
                        <Button variant="destructive">
                            <Plus className="h-4 w-4" />
                            Report Incident
                        </Button>
                    </Link>
                }
            >
                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search incidents..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-2">
                        {statuses.map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                            >
                                {status === "all"
                                    ? "All"
                                    : (INCIDENT_STATUS_CONFIG[
                                          status as keyof typeof INCIDENT_STATUS_CONFIG
                                      ]?.label ?? status.replace("_", " "))}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Total Incidents"
                        value={incidents.length}
                        icon={AlertTriangle}
                    />
                    <StatCard
                        title="Open"
                        value={openIncidents.length}
                        icon={AlertTriangle}
                        className={openIncidents.length > 0 ? "border-warning/50 bg-warning/5" : ""}
                    />
                    <StatCard
                        title="Critical/Major"
                        value={criticalIncidents.length}
                        icon={AlertTriangle}
                        className={
                            criticalIncidents.length > 0
                                ? "border-destructive/50 bg-destructive/5"
                                : ""
                        }
                    />
                    <StatCard
                        title="Est. Cost"
                        value={formatCurrency(
                            incidents.reduce((sum, i) => sum + (i.estimatedCost || 0), 0)
                        )}
                        icon={Shield}
                    />
                </div>

                {/* Incidents List */}
                {filteredIncidents.length === 0 ? (
                    <EmptyState
                        icon={Shield}
                        title="No incidents found"
                        description={
                            searchQuery
                                ? "Try adjusting your search"
                                : "No incidents have been reported"
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredIncidents.map((incident) => {
                            const typeConfig =
                                INCIDENT_TYPE_CONFIG[
                                    incident.type as keyof typeof INCIDENT_TYPE_CONFIG
                                ];
                            const severityConfig =
                                INCIDENT_SEVERITY_CONFIG[
                                    incident.severity as keyof typeof INCIDENT_SEVERITY_CONFIG
                                ];
                            const statusConfig =
                                INCIDENT_STATUS_CONFIG[
                                    incident.status as keyof typeof INCIDENT_STATUS_CONFIG
                                ];
                            const location = locations.find((l) => l.id === incident.locationId);
                            const project = projects.find((p) => p.id === incident.projectId);
                            const TypeIcon = typeConfig?.icon || AlertTriangle;

                            return (
                                <Link key={incident.id} href={`/incidents/${incident.id}`}>
                                    <Card
                                        className={`hover:shadow-md hover:border-primary/30 transition-all cursor-pointer ${
                                            incident.severity === "critical"
                                                ? "border-destructive/50"
                                                : incident.severity === "major"
                                                  ? "border-warning/50"
                                                  : ""
                                        }`}
                                    >
                                        <CardContent className="flex items-center gap-4 py-4">
                                            <div
                                                className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                                                    incident.severity === "critical"
                                                        ? "bg-destructive/10"
                                                        : incident.severity === "major"
                                                          ? "bg-warning/10"
                                                          : "bg-secondary"
                                                }`}
                                            >
                                                <TypeIcon
                                                    className={`h-6 w-6 ${
                                                        incident.severity === "critical"
                                                            ? "text-destructive"
                                                            : incident.severity === "major"
                                                              ? "text-warning"
                                                              : "text-muted-foreground"
                                                    }`}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        {incident.number}
                                                    </span>
                                                    <h3 className="font-semibold truncate">
                                                        {incident.title}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge
                                                        variant={
                                                            (severityConfig?.variant as
                                                                | "secondary"
                                                                | "warning"
                                                                | "destructive") || "secondary"
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {severityConfig?.label || incident.severity}
                                                    </Badge>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px]"
                                                    >
                                                        {typeConfig?.label || incident.type}
                                                    </Badge>
                                                    <Badge
                                                        variant={
                                                            (statusConfig?.variant as
                                                                | "secondary"
                                                                | "success"
                                                                | "warning"
                                                                | "info") || "secondary"
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {statusConfig?.label || incident.status}
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
                                                    {incident.specificLocation && (
                                                        <span>@ {incident.specificLocation}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="text-center">
                                                    <p className="text-muted-foreground text-xs">
                                                        Occurred
                                                    </p>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(
                                                            incident.occurredAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {incident.estimatedCost && (
                                                    <div className="text-center">
                                                        <p className="text-muted-foreground text-xs">
                                                            Est. Cost
                                                        </p>
                                                        <p className="font-medium">
                                                            {formatCurrency(incident.estimatedCost)}
                                                        </p>
                                                    </div>
                                                )}
                                                {incident.insuranceClaim && (
                                                    <Badge
                                                        variant="warning"
                                                        className="text-[10px]"
                                                    >
                                                        Insurance Claim
                                                    </Badge>
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
