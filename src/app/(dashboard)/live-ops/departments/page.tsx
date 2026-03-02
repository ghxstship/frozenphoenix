"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, CheckCircle2, LayoutList, Users } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";

interface MockDeptStatus {
    id: string;
    department: string;
    lead: string;
    status: string;
    crewCount: number;
    crewCheckedIn: number;
    issues?: string;
}

const mockDepts: MockDeptStatus[] = [
    {
        id: "1",
        department: "Audio",
        lead: "Sam Chen",
        status: "ready",
        crewCount: 6,
        crewCheckedIn: 6,
    },
    {
        id: "2",
        department: "Lighting",
        lead: "Alex Torres",
        status: "ready",
        crewCount: 8,
        crewCheckedIn: 8,
    },
    {
        id: "3",
        department: "Video",
        lead: "Morgan Blake",
        status: "setting_up",
        crewCount: 5,
        crewCheckedIn: 5,
    },
    {
        id: "4",
        department: "Rigging",
        lead: "Lee Park",
        status: "ready",
        crewCount: 4,
        crewCheckedIn: 4,
    },
    {
        id: "5",
        department: "Stage",
        lead: "Pat Davis",
        status: "active",
        crewCount: 10,
        crewCheckedIn: 10,
    },
    {
        id: "6",
        department: "FOH",
        lead: "Jordan Lee",
        status: "setting_up",
        crewCount: 12,
        crewCheckedIn: 10,
        issues: "2 crew delayed — ETA 15 min",
    },
    {
        id: "7",
        department: "Security",
        lead: "Chris Ruiz",
        status: "ready",
        crewCount: 8,
        crewCheckedIn: 8,
    },
    {
        id: "8",
        department: "Catering",
        lead: "Taylor Kim",
        status: "not_checked_in",
        crewCount: 6,
        crewCheckedIn: 0,
    },
];

export default function DepartmentStatusPage() {
    const ready = mockDepts.filter((d) => d.status === "ready" || d.status === "active").length;
    const withIssues = mockDepts.filter((d) => d.issues).length;
    const totalCrew = mockDepts.reduce((s, d) => s + d.crewCount, 0);
    const checkedIn = mockDepts.reduce((s, d) => s + d.crewCheckedIn, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Department Status"
                description="Real-time department readiness and crew check-in status"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Departments Ready"
                    value={`${ready}/${mockDepts.length}`}
                    icon={CheckCircle2}
                />
                <StatCard title="Issues Flagged" value={withIssues} icon={AlertTriangle} />
                <StatCard
                    title="Crew Checked In"
                    value={`${checkedIn}/${totalCrew}`}
                    icon={Users}
                />
                <StatCard title="Total Departments" value={mockDepts.length} icon={LayoutList} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {mockDepts.map((dept, i) => (
                    <StaggerItem key={dept.id} index={i} stagger="tight">
                        <Card className="hover:shadow-sm transition-all">
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold">{dept.department}</h3>
                                    <StatusBadge status={dept.status} className="text-[10px]" />
                                </div>
                                <p className="text-[11px] text-muted-foreground mb-2">
                                    Lead: {dept.lead}
                                </p>
                                <div className="flex items-center gap-2 mb-1">
                                    <ProgressBar
                                        value={(dept.crewCheckedIn / dept.crewCount) * 100}
                                        size="xs"
                                        className="flex-1"
                                    />
                                    <span className="text-[10px] font-medium">
                                        {dept.crewCheckedIn}/{dept.crewCount}
                                    </span>
                                </div>
                                {dept.issues && (
                                    <p className="text-[10px] text-warning mt-2 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3 shrink-0" />
                                        {dept.issues}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </div>
        </div>
    );
}
