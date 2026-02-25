"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { HardHat, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface MockLiveCrew {
    id: string;
    name: string;
    department: string;
    role: string;
    status: string;
    checkedInAt?: string;
    radioCallsign?: string;
    hoursWorked: number;
    overtimeFlagged: boolean;
}

const mockCrew: MockLiveCrew[] = [
    { id: "1", name: "Alex Torres", department: "Lighting", role: "Lighting Lead", status: "checked_in", checkedInAt: "06:00", radioCallsign: "LIGHT-1", hoursWorked: 8.5, overtimeFlagged: true },
    { id: "2", name: "Sam Chen", department: "Audio", role: "Audio Lead", status: "checked_in", checkedInAt: "06:15", radioCallsign: "AUDIO-1", hoursWorked: 8.0, overtimeFlagged: false },
    { id: "3", name: "Morgan Blake", department: "Video", role: "Video Lead", status: "checked_in", checkedInAt: "07:00", radioCallsign: "VIDEO-1", hoursWorked: 7.0, overtimeFlagged: false },
    { id: "4", name: "Jordan Lee", department: "FOH", role: "FOH Manager", status: "checked_in", checkedInAt: "08:00", hoursWorked: 6.0, overtimeFlagged: false },
    { id: "5", name: "Pat Davis", department: "Stage", role: "Stage Manager", status: "checked_in", checkedInAt: "05:45", radioCallsign: "SM-1", hoursWorked: 9.0, overtimeFlagged: true },
    { id: "6", name: "Casey Kim", department: "VIP Services", role: "VIP Coordinator", status: "checked_in", checkedInAt: "09:00", hoursWorked: 5.0, overtimeFlagged: false },
    { id: "7", name: "Chris Ruiz", department: "Security", role: "Security Lead", status: "checked_in", checkedInAt: "07:30", radioCallsign: "SEC-1", hoursWorked: 6.5, overtimeFlagged: false },
    { id: "8", name: "Taylor Kim", department: "Catering", role: "Catering Lead", status: "unavailable", hoursWorked: 0, overtimeFlagged: false },
];

export default function LiveCrewPage() {
    const [search, setSearch] = useState("");

    const checkedIn = mockCrew.filter(c => c.status === "checked_in").length;
    const overtime = mockCrew.filter(c => c.overtimeFlagged).length;
    const totalHours = mockCrew.reduce((s, c) => s + c.hoursWorked, 0);

    const filtered = mockCrew.filter(c =>
        !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.department.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Live Crew" description="On-site crew assignments, check-in status, and overtime tracking" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Checked In" value={`${checkedIn}/${mockCrew.length}`} icon={CheckCircle2} />
                <StatCard title="Overtime Flagged" value={overtime} icon={AlertTriangle} />
                <StatCard title="Total Hours Today" value={totalHours.toFixed(1)} icon={Clock} />
                <StatCard title="Total Crew" value={mockCrew.length} icon={HardHat} />
            </div>

            <SearchInput value={search} onValueChange={setSearch} placeholder="Search crew..." className="max-w-sm" />

            <div className="space-y-2">
                {filtered.map((member, i) => (
                    <StaggerItem key={member.id} index={i} stagger="tight">
                    <Card className={`hover:shadow-sm transition-all ${member.overtimeFlagged ? "border-l-2 border-l-warning" : ""}`}>
                        <CardContent className="py-3">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold">
                                    {member.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold truncate">{member.name}</h3>
                                        <StatusBadge status={member.status} className="text-[10px] shrink-0" />
                                        {member.overtimeFlagged && <span className="text-[10px] text-warning font-medium shrink-0">OT</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                        <span>{member.department} — {member.role}</span>
                                        {member.radioCallsign && <span className="font-mono">{member.radioCallsign}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm shrink-0">
                                    {member.checkedInAt && (
                                        <div className="text-right">
                                            <p className="font-medium">{member.checkedInAt}</p>
                                            <p className="text-[10px] text-muted-foreground">checked in</p>
                                        </div>
                                    )}
                                    <div className="text-right">
                                        <p className="font-medium">{member.hoursWorked}h</p>
                                        <p className="text-[10px] text-muted-foreground">worked</p>
                                    </div>
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
