"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Megaphone, Search, Plus, CheckCircle2, Clock, Play } from "lucide-react";

interface MockCue {
    id: string;
    cueNumber: string;
    title: string;
    department: string;
    scheduledTime: string;
    actualTime?: string;
    status: string;
    isCritical: boolean;
    responsible: string;
}

const mockCues: MockCue[] = [
    { id: "1", cueNumber: "Q001", title: "House Lights to 50%", department: "Lighting", scheduledTime: "18:00", actualTime: "18:00", status: "completed", isCritical: false, responsible: "Alex Torres" },
    { id: "2", cueNumber: "Q002", title: "Welcome Music Start", department: "Audio", scheduledTime: "18:05", actualTime: "18:04", status: "completed", isCritical: false, responsible: "Sam Chen" },
    { id: "3", cueNumber: "Q003", title: "Doors Open", department: "FOH", scheduledTime: "18:15", actualTime: "18:15", status: "completed", isCritical: true, responsible: "Jordan Lee" },
    { id: "4", cueNumber: "Q004", title: "VIP Pre-Show Greeting", department: "VIP Services", scheduledTime: "18:30", status: "in_progress", isCritical: false, responsible: "Casey Kim" },
    { id: "5", cueNumber: "Q005", title: "Stage Wash — Opening Look", department: "Lighting", scheduledTime: "19:00", status: "standby", isCritical: true, responsible: "Alex Torres" },
    { id: "6", cueNumber: "Q006", title: "MC Introduction", department: "Stage", scheduledTime: "19:02", status: "pending", isCritical: true, responsible: "Pat Davis" },
    { id: "7", cueNumber: "Q007", title: "Video Roll — Sizzle Reel", department: "Video", scheduledTime: "19:05", status: "pending", isCritical: false, responsible: "Morgan Blake" },
    { id: "8", cueNumber: "Q008", title: "Keynote Speaker Entry", department: "Stage", scheduledTime: "19:10", status: "pending", isCritical: true, responsible: "Pat Davis" },
];

export default function RunOfShowPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const completed = mockCues.filter(c => c.status === "completed").length;
    const inProgress = mockCues.filter(c => ["in_progress", "standby", "called"].includes(c.status)).length;
    const upcoming = mockCues.filter(c => c.status === "pending").length;

    const filtered = mockCues.filter(c => {
        const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.cueNumber.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Run of Show" description="Live cue management — sequence, timing, and execution tracking">
                <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Cue</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Cues" value={mockCues.length} icon={Megaphone} />
                <StatCard title="Completed" value={completed} icon={CheckCircle2} />
                <StatCard title="Active / Standby" value={inProgress} icon={Play} />
                <StatCard title="Upcoming" value={upcoming} icon={Clock} />
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search cues..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["all", "completed", "in_progress", "standby", "called", "pending", "held", "skipped"].map(s => (
                        <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
                            {s === "all" ? "All" : getStatusLabel(s)}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                {filtered.map((cue, i) => (
                    <Card key={cue.id} className={`hover:shadow-sm transition-all animate-slide-up ${cue.isCritical ? "border-l-2 border-l-destructive" : ""}`} style={{ animationDelay: `${i * 30}ms` }}>
                        <CardContent className="py-3">
                            <div className="flex items-center gap-4">
                                <div className="w-14 text-center shrink-0">
                                    <p className="text-sm font-mono font-bold">{cue.cueNumber}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold truncate">{cue.title}</h3>
                                        <StatusBadge status={cue.status} className="text-[10px] shrink-0" />
                                        {cue.isCritical && <span className="text-[10px] text-destructive font-medium shrink-0">CRITICAL</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                        <span>{cue.department}</span>
                                        <span>{cue.responsible}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm shrink-0">
                                    <div className="text-right">
                                        <p className="font-medium">{cue.scheduledTime}</p>
                                        <p className="text-[10px] text-muted-foreground">scheduled</p>
                                    </div>
                                    {cue.actualTime && (
                                        <div className="text-right">
                                            <p className="font-medium">{cue.actualTime}</p>
                                            <p className="text-[10px] text-muted-foreground">actual</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filtered.length === 0 && (
                <Card><CardContent className="flex flex-col items-center justify-center py-12">
                    <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-1">No cues found</h3>
                    <p className="text-muted-foreground text-center">Adjust filters or search terms</p>
                </CardContent></Card>
            )}
        </div>
    );
}
