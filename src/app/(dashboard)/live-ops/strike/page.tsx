"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, ArrowDownToLine, CheckCircle2, Clock } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";

interface MockStrikeStep {
    id: string;
    sequence: number;
    name: string;
    department: string;
    status: string;
    estimatedDurationMinutes: number;
    actualDurationMinutes?: number;
    responsibleName: string;
    dependsOn: string[];
    notes?: string;
}

const mockStrikeSteps: MockStrikeStep[] = [
    {
        id: "1",
        sequence: 1,
        name: "House Lights Up / Audience Clear",
        department: "FOH",
        status: "completed",
        estimatedDurationMinutes: 15,
        actualDurationMinutes: 12,
        responsibleName: "Jordan Lee",
        dependsOn: [],
    },
    {
        id: "2",
        sequence: 2,
        name: "De-rig Audio — FOH & Monitors",
        department: "Audio",
        status: "completed",
        estimatedDurationMinutes: 45,
        actualDurationMinutes: 50,
        responsibleName: "Sam Chen",
        dependsOn: ["1"],
    },
    {
        id: "3",
        sequence: 3,
        name: "De-rig Lighting Fixtures",
        department: "Lighting",
        status: "in_progress",
        estimatedDurationMinutes: 60,
        responsibleName: "Alex Torres",
        dependsOn: ["1"],
    },
    {
        id: "4",
        sequence: 4,
        name: "De-rig Video / LED Walls",
        department: "Video",
        status: "in_progress",
        estimatedDurationMinutes: 45,
        responsibleName: "Morgan Blake",
        dependsOn: ["1"],
    },
    {
        id: "5",
        sequence: 5,
        name: "Rigging Down — Chain Motors",
        department: "Rigging",
        status: "pending",
        estimatedDurationMinutes: 90,
        responsibleName: "Rigging Lead",
        dependsOn: ["3", "4"],
        notes: "Safety officer must be present",
    },
    {
        id: "6",
        sequence: 6,
        name: "Stage Deck Strike",
        department: "Stage",
        status: "pending",
        estimatedDurationMinutes: 60,
        responsibleName: "Pat Davis",
        dependsOn: ["5"],
    },
    {
        id: "7",
        sequence: 7,
        name: "VIP / FOH Furniture & Decor",
        department: "FOH",
        status: "pending",
        estimatedDurationMinutes: 30,
        responsibleName: "Casey Kim",
        dependsOn: ["1"],
    },
    {
        id: "8",
        sequence: 8,
        name: "Load Trucks — Priority Items",
        department: "Logistics",
        status: "pending",
        estimatedDurationMinutes: 120,
        responsibleName: "Logistics Lead",
        dependsOn: ["2", "6", "7"],
    },
];

export default function StrikePage() {
    const completed = mockStrikeSteps.filter((s) => s.status === "completed").length;
    const inProgress = mockStrikeSteps.filter((s) => s.status === "in_progress").length;
    const totalEstimate = mockStrikeSteps.reduce((s, step) => s + step.estimatedDurationMinutes, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Strike & Load-Out"
                description="Demobilization sequence, dependency tracking, and load-out progress"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Completed"
                    value={`${completed}/${mockStrikeSteps.length}`}
                    icon={CheckCircle2}
                />
                <StatCard title="In Progress" value={inProgress} icon={Clock} />
                <StatCard
                    title="Estimated Total"
                    value={`${Math.round(totalEstimate / 60)}h ${totalEstimate % 60}m`}
                    icon={ArrowDownToLine}
                />
                <StatCard
                    title="Blocked"
                    value={mockStrikeSteps.filter((s) => s.status === "blocked").length}
                    icon={AlertTriangle}
                />
            </div>

            <div className="space-y-2">
                {mockStrikeSteps.map((step, i) => (
                    <StaggerItem key={step.id} index={i} stagger="tight">
                        <Card
                            className={`hover:shadow-sm transition-all ${step.status === "in_progress" ? "border-l-2 border-l-info" : step.status === "completed" ? "border-l-2 border-l-success" : ""}`}
                        >
                            <CardContent className="py-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono font-bold bg-secondary px-2 py-0.5 rounded shrink-0">
                                        #{step.sequence}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold truncate">
                                                {step.name}
                                            </h3>
                                            <StatusBadge
                                                status={step.status}
                                                className="text-[10px] shrink-0"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                            <span>{step.department}</span>
                                            <span>{step.responsibleName}</span>
                                            <span>Est: {step.estimatedDurationMinutes}m</span>
                                            {step.actualDurationMinutes && (
                                                <span>Actual: {step.actualDurationMinutes}m</span>
                                            )}
                                        </div>
                                        {step.dependsOn.length > 0 && (
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                Depends on: #{step.dependsOn.join(", #")}
                                            </p>
                                        )}
                                        {step.notes && (
                                            <p className="text-[10px] text-warning mt-0.5">
                                                {step.notes}
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
