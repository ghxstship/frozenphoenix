"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

interface MockGuestIncident {
    id: string;
    type: string;
    severity: string;
    status: string;
    description: string;
    zoneName: string;
    reportedAt: string;
    guestName?: string;
    assignedTo?: string;
    resolution?: string;
}

const mockIncidents: MockGuestIncident[] = [
    { id: "GI-001", type: "complaint", severity: "minor", status: "resolved", description: "Long wait time at Main Bar — guest unhappy with 15min queue", zoneName: "Main Bar", reportedAt: "17:30", guestName: "Anonymous", assignedTo: "Jordan Lee", resolution: "Opened express lane" },
    { id: "GI-002", type: "injury", severity: "moderate", status: "investigating", description: "Guest twisted ankle on uneven ground near VIP entrance", zoneName: "VIP Lounge", reportedAt: "18:05", guestName: "Rachel Kim", assignedTo: "Medical Team" },
    { id: "GI-003", type: "lost_item", severity: "minor", status: "reported", description: "Guest lost phone near Merch Tent — black iPhone 16", zoneName: "Merch Tent", reportedAt: "18:20", guestName: "Tom Harris" },
    { id: "GI-004", type: "disturbance", severity: "major", status: "investigating", description: "Altercation between two guests near stage barrier", zoneName: "General Admission", reportedAt: "18:35", assignedTo: "Security Lead" },
    { id: "GI-005", type: "accessibility", severity: "moderate", status: "resolved", description: "Wheelchair ramp blocked by equipment near South Entry", zoneName: "Main Entry", reportedAt: "16:45", assignedTo: "Logistics Lead", resolution: "Ramp cleared, barrier installed" },
];

const SEVERITY_BORDERS: Record<string, string> = {
    minor: "",
    moderate: "border-l-warning",
    major: "border-l-destructive",
};

export default function GuestIncidentsPage() {
    const [search, setSearch] = useState("");

    const active = mockIncidents.filter(i => i.status !== "resolved" && i.status !== "closed").length;
    const resolved = mockIncidents.filter(i => i.status === "resolved").length;

    const filtered = mockIncidents.filter(i =>
        !search || i.description.toLowerCase().includes(search.toLowerCase()) || i.zoneName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Guest Incidents" description="Complaints, injuries, lost items, and disturbances — tracking and resolution" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Incidents" value={mockIncidents.length} icon={AlertTriangle} />
                <StatCard title="Active" value={active} icon={Clock} />
                <StatCard title="Resolved" value={resolved} icon={CheckCircle2} />
                <StatCard title="Major" value={mockIncidents.filter(i => i.severity === "major").length} icon={AlertTriangle} />
            </div>

            <SearchInput value={search} onValueChange={setSearch} placeholder="Search incidents..." className="max-w-sm" />

            <div className="space-y-2">
                {filtered.map((incident, i) => (
                    <StaggerItem key={incident.id} index={i} stagger="tight">
                    <Card className={`hover:shadow-sm transition-all border-l-2 ${SEVERITY_BORDERS[incident.severity] ?? ""}`}>
                        <CardContent className="py-3">
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 mt-0.5">
                                    <span className="text-xs font-mono font-bold bg-secondary px-1.5 py-0.5 rounded">{incident.id}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <StatusBadge status={incident.type} className="text-[10px]" />
                                        <StatusBadge status={incident.severity} className="text-[10px]" />
                                        <StatusBadge status={incident.status} className="text-[10px]" />
                                    </div>
                                    <p className="text-sm mt-1">{incident.description}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                                        <span>{incident.zoneName}</span>
                                        <span>{incident.reportedAt}</span>
                                        {incident.guestName && <span>Guest: {incident.guestName}</span>}
                                        {incident.assignedTo && <span>Assigned: {incident.assignedTo}</span>}
                                    </div>
                                    {incident.resolution && (
                                        <p className="text-[11px] text-success mt-1">Resolution: {incident.resolution}</p>
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
