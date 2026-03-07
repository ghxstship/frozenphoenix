"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, Radio, Users } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { PermissionGate } from "@/components/permission-guard";

// NEXT: Wire to Supabase when live_events/incidents queries are available
type EventPhase =
    | "advance"
    | "load_in"
    | "setup"
    | "rehearsal"
    | "ready"
    | "live"
    | "hold"
    | "strike"
    | "wrapped";

interface MockLiveEvent {
    id: string;
    eventName: string;
    projectName: string;
    phase: EventPhase;
    riskLevel: string;
    venueCapacity: number;
    currentAttendance: number;
    departmentsReady: number;
    departmentsTotal: number;
    gatesCompleted: number;
    gatesTotal: number;
    activeIncidents: number;
    cuesCompleted: number;
    cuesTotal: number;
}

const mockEvents: MockLiveEvent[] = [
    {
        id: "1",
        eventName: "SXSW Brand Activation",
        projectName: "Project Horizon",
        phase: "live",
        riskLevel: "low",
        venueCapacity: 2000,
        currentAttendance: 1450,
        departmentsReady: 8,
        departmentsTotal: 8,
        gatesCompleted: 12,
        gatesTotal: 12,
        activeIncidents: 1,
        cuesCompleted: 18,
        cuesTotal: 24,
    },
    {
        id: "2",
        eventName: "Annual Gala — Main Stage",
        projectName: "Stellar Events",
        phase: "setup",
        riskLevel: "moderate",
        venueCapacity: 800,
        currentAttendance: 0,
        departmentsReady: 5,
        departmentsTotal: 8,
        gatesCompleted: 7,
        gatesTotal: 10,
        activeIncidents: 0,
        cuesCompleted: 0,
        cuesTotal: 32,
    },
    {
        id: "3",
        eventName: "Product Launch — NYC",
        projectName: "TechVision 2026",
        phase: "load_in",
        riskLevel: "low",
        venueCapacity: 500,
        currentAttendance: 0,
        departmentsReady: 2,
        departmentsTotal: 6,
        gatesCompleted: 3,
        gatesTotal: 8,
        activeIncidents: 0,
        cuesCompleted: 0,
        cuesTotal: 15,
    },
    {
        id: "4",
        eventName: "Festival Day 2",
        projectName: "Summer Series",
        phase: "wrapped",
        riskLevel: "low",
        venueCapacity: 5000,
        currentAttendance: 0,
        departmentsReady: 10,
        departmentsTotal: 10,
        gatesCompleted: 15,
        gatesTotal: 15,
        activeIncidents: 0,
        cuesCompleted: 40,
        cuesTotal: 40,
    },
];

const RISK_COLORS: Record<string, string> = {
    low: "text-success",
    moderate: "text-warning",
    high: "text-destructive",
    critical: "text-destructive",
};

export default function LiveOpsPage() {
    const [phaseFilter, setPhaseFilter] = useState<string>("all");

    const activeEvents = mockEvents.filter((e) => !["wrapped"].includes(e.phase));
    const liveNow = mockEvents.filter((e) => e.phase === "live").length;
    const totalIncidents = mockEvents.reduce((s, e) => s + e.activeIncidents, 0);
    const totalAttendance = mockEvents.reduce((s, e) => s + e.currentAttendance, 0);

    const filtered = mockEvents.filter((e) => phaseFilter === "all" || e.phase === phaseFilter);

    return (
        <PermissionGate resource="live_ops" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Live Operations — Command Dashboard"
                    description="Real-time operational overview of all active live events"
                >
                    <Button size="sm">
                        <Radio className="mr-2 h-4 w-4" />
                        New Live Event
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Active Events" value={activeEvents.length} icon={Radio} />
                    <StatCard title="Live Now" value={liveNow} icon={Activity} />
                    <StatCard
                        title="Total Attendance"
                        value={totalAttendance.toLocaleString()}
                        icon={Users}
                    />
                    <StatCard
                        title="Active Incidents"
                        value={totalIncidents}
                        icon={AlertTriangle}
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {[
                        "all",
                        "advance",
                        "load_in",
                        "setup",
                        "rehearsal",
                        "ready",
                        "live",
                        "hold",
                        "strike",
                        "wrapped",
                    ].map((phase) => (
                        <Button
                            key={phase}
                            variant={phaseFilter === phase ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPhaseFilter(phase)}
                        >
                            {phase === "all" ? "All" : getStatusLabel(phase)}
                        </Button>
                    ))}
                </div>

                <div className="space-y-3">
                    {filtered.map((evt, i) => (
                        <StaggerItem key={evt.id} index={i} stagger="tight">
                            <Card className="hover:shadow-sm transition-all">
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                            <Radio className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-sm font-semibold truncate">
                                                    {evt.eventName}
                                                </h3>
                                                <StatusBadge
                                                    status={evt.phase}
                                                    className="text-[10px] shrink-0"
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                {evt.projectName}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-6 text-xs shrink-0">
                                            <div className="text-center">
                                                <p className="font-semibold">
                                                    {evt.departmentsReady}/{evt.departmentsTotal}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Depts Ready
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold">
                                                    {evt.gatesCompleted}/{evt.gatesTotal}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Gates
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold">
                                                    {evt.cuesCompleted}/{evt.cuesTotal}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Cues
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p
                                                    className={`font-semibold ${RISK_COLORS[evt.riskLevel] ?? ""}`}
                                                >
                                                    {evt.riskLevel}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Risk
                                                </p>
                                            </div>
                                            {evt.currentAttendance > 0 && (
                                                <div className="text-center">
                                                    <p className="font-semibold">
                                                        {evt.currentAttendance.toLocaleString()}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Attendance
                                                    </p>
                                                </div>
                                            )}
                                            {evt.activeIncidents > 0 && (
                                                <div className="text-center">
                                                    <p className="font-semibold text-destructive">
                                                        {evt.activeIncidents}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Incidents
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Radio className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-1">No live events</h3>
                            <p className="text-muted-foreground text-center">
                                No events match the selected phase filter
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PermissionGate>
    );
}
