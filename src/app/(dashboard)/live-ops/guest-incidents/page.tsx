"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { LoadingState } from "@/components/layouts/loading-state";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useGuestIncidents } from "@/lib/supabase/hooks-live-ops";

const SEVERITY_BORDERS: Record<string, string> = {
    minor: "",
    moderate: "border-l-warning",
    major: "border-l-destructive",
};

export default function GuestIncidentsPage() {
    const [search, setSearch] = useState("");
    const { data: incidents, isLoading } = useGuestIncidents();

    if (isLoading) return <LoadingState />;

    const rows = incidents ?? [];
    const active = rows.filter(
        (i) => i.status !== "resolved" && i.status !== "closed"
    ).length;
    const resolved = rows.filter((i) => i.status === "resolved").length;

    const filtered = rows.filter(
        (i) =>
            !search ||
            i.description.toLowerCase().includes(search.toLowerCase()) ||
            (i.guest_name ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Guest Incidents"
                description="Complaints, injuries, lost items, and disturbances — tracking and resolution"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Incidents"
                    value={rows.length}
                    icon={AlertTriangle}
                />
                <StatCard title="Active" value={active} icon={Clock} />
                <StatCard title="Resolved" value={resolved} icon={CheckCircle2} />
                <StatCard
                    title="Major"
                    value={rows.filter((i) => i.severity === "major").length}
                    icon={AlertTriangle}
                />
            </div>

            <SearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search incidents..."
                className="max-w-sm"
            />

            <div className="space-y-2">
                {filtered.map((incident, i) => (
                    <StaggerItem key={incident.id} index={i} stagger="tight">
                        <Card
                            className={`hover:shadow-sm transition-all border-l-2 ${SEVERITY_BORDERS[incident.severity] ?? ""}`}
                        >
                            <CardContent className="py-3">
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 mt-0.5">
                                        <span className="text-xs font-mono font-bold bg-secondary px-1.5 py-0.5 rounded">
                                            {incident.id.slice(0, 8)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <StatusBadge
                                                status={incident.type}
                                                className="text-[10px]"
                                            />
                                            <StatusBadge
                                                status={incident.severity}
                                                className="text-[10px]"
                                            />
                                            <StatusBadge
                                                status={incident.status}
                                                className="text-[10px]"
                                            />
                                        </div>
                                        <p className="text-sm mt-1">{incident.description}</p>
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                                            {incident.foh_zone_id && <span>{incident.foh_zone_id}</span>}
                                            {incident.reported_at && (
                                                <span>{new Date(incident.reported_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                            )}
                                            {incident.guest_name && (
                                                <span>Guest: {incident.guest_name}</span>
                                            )}
                                            {incident.assigned_to_id && (
                                                <span>Assigned: {incident.assigned_to_id}</span>
                                            )}
                                        </div>
                                        {incident.resolution && (
                                            <p className="text-[11px] text-success mt-1">
                                                Resolution: {incident.resolution}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </div>
        </div>
    );
}
