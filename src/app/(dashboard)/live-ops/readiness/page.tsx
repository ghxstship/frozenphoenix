"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Gauge, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

interface MockGate {
    id: string;
    gateNumber: number;
    name: string;
    verifierRole: string;
    status: string;
    isBlocking: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
}

const mockGates: MockGate[] = [
    { id: "1", gateNumber: 1, name: "Venue Access Confirmed", verifierRole: "Event Commander", status: "passed", isBlocking: true, verifiedBy: "Dana Wright", verifiedAt: "2026-02-24T14:00:00Z" },
    { id: "2", gateNumber: 2, name: "Power & Utilities Verified", verifierRole: "Technical Director", status: "passed", isBlocking: true, verifiedBy: "Alex Torres", verifiedAt: "2026-02-24T15:30:00Z" },
    { id: "3", gateNumber: 3, name: "Rigging Inspection Complete", verifierRole: "Safety Officer", status: "passed", isBlocking: true, verifiedBy: "Kim Park", verifiedAt: "2026-02-24T16:00:00Z" },
    { id: "4", gateNumber: 4, name: "Audio System Check", verifierRole: "Audio Lead", status: "in_progress", isBlocking: true },
    { id: "5", gateNumber: 5, name: "Video System Check", verifierRole: "Video Lead", status: "in_progress", isBlocking: true },
    { id: "6", gateNumber: 6, name: "Fire Safety Walkthrough", verifierRole: "Safety Officer", status: "not_started", isBlocking: true },
    { id: "7", gateNumber: 7, name: "Catering Setup Verified", verifierRole: "FOH Manager", status: "not_started", isBlocking: false },
    { id: "8", gateNumber: 8, name: "Security Briefing Complete", verifierRole: "Security Lead", status: "not_started", isBlocking: true },
    { id: "9", gateNumber: 9, name: "VIP Areas Prepared", verifierRole: "FOH Manager", status: "waived", isBlocking: false },
    { id: "10", gateNumber: 10, name: "Comms Check All Channels", verifierRole: "Production Coordinator", status: "not_started", isBlocking: true },
];

export default function ReadinessGatesPage() {
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const passed = mockGates.filter(g => g.status === "passed").length;
    const inProgress = mockGates.filter(g => g.status === "in_progress").length;
    const notStarted = mockGates.filter(g => g.status === "not_started").length;
    const blockingRemaining = mockGates.filter(g => g.isBlocking && !["passed", "waived"].includes(g.status)).length;

    const filtered = mockGates.filter(g => statusFilter === "all" || g.status === statusFilter);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Readiness Gates" description="Pre-show verification checkpoints — all blocking gates must pass before doors open" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Passed" value={passed} icon={CheckCircle2} />
                <StatCard title="In Progress" value={inProgress} icon={Clock} />
                <StatCard title="Not Started" value={notStarted} icon={Gauge} />
                <StatCard title="Blocking Remaining" value={blockingRemaining} icon={AlertTriangle} />
            </div>

            {blockingRemaining > 0 && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="py-3 flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-destructive shrink-0" />
                        <p className="text-sm font-medium text-destructive">{blockingRemaining} blocking gate(s) still outstanding — doors cannot open</p>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-2 flex-wrap">
                {["all", "passed", "in_progress", "not_started", "failed", "waived"].map(s => (
                    <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
                        {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </Button>
                ))}
            </div>

            <div className="space-y-2">
                {filtered.map((gate, i) => (
                    <Card key={gate.id} className={`hover:shadow-sm transition-all animate-slide-up ${gate.isBlocking && !["passed", "waived"].includes(gate.status) ? "border-l-2 border-l-destructive" : ""}`} style={{ animationDelay: `${i * 30}ms` }}>
                        <CardContent className="py-3">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-bold">
                                    G{gate.gateNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold truncate">{gate.name}</h3>
                                        <StatusBadge status={gate.status} className="text-[10px] shrink-0" />
                                        {gate.isBlocking && <span className="text-[10px] text-destructive font-medium shrink-0">BLOCKING</span>}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Verifier: {gate.verifierRole}</p>
                                </div>
                                {gate.verifiedBy && (
                                    <div className="text-right text-xs shrink-0">
                                        <p className="font-medium">{gate.verifiedBy}</p>
                                        <p className="text-[10px] text-muted-foreground">{gate.verifiedAt ? new Date(gate.verifiedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
