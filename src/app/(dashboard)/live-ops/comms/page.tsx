"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Lock, MessageSquare, Radio } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";

interface MockChannel {
    id: string;
    channelNumber: number;
    name: string;
    priority: string;
    assignment: string;
    discipline: string;
    isRestricted: boolean;
    recentMessages: number;
}

const mockChannels: MockChannel[] = [
    {
        id: "1",
        channelNumber: 1,
        name: "Command",
        priority: "emergency",
        assignment: "Event Commander + Safety",
        discipline: "Command",
        isRestricted: true,
        recentMessages: 12,
    },
    {
        id: "2",
        channelNumber: 2,
        name: "Production",
        priority: "high",
        assignment: "SM + All Dept Leads",
        discipline: "Production",
        isRestricted: false,
        recentMessages: 45,
    },
    {
        id: "3",
        channelNumber: 3,
        name: "Audio",
        priority: "medium",
        assignment: "Audio Team",
        discipline: "Audio",
        isRestricted: false,
        recentMessages: 18,
    },
    {
        id: "4",
        channelNumber: 4,
        name: "Lighting",
        priority: "medium",
        assignment: "Lighting Team",
        discipline: "Lighting",
        isRestricted: false,
        recentMessages: 22,
    },
    {
        id: "5",
        channelNumber: 5,
        name: "Video",
        priority: "medium",
        assignment: "Video Team",
        discipline: "Video",
        isRestricted: false,
        recentMessages: 14,
    },
    {
        id: "6",
        channelNumber: 6,
        name: "Rigging",
        priority: "high",
        assignment: "Rigging + Safety",
        discipline: "Rigging",
        isRestricted: true,
        recentMessages: 8,
    },
    {
        id: "7",
        channelNumber: 7,
        name: "FOH / Security",
        priority: "high",
        assignment: "FOH + Security Leads",
        discipline: "FOH",
        isRestricted: false,
        recentMessages: 31,
    },
    {
        id: "8",
        channelNumber: 8,
        name: "Logistics",
        priority: "medium",
        assignment: "Logistics + Loading Dock",
        discipline: "Logistics",
        isRestricted: false,
        recentMessages: 9,
    },
];

const PRIORITY_COLORS: Record<string, string> = {
    emergency: "border-l-destructive",
    critical: "border-l-destructive",
    high: "border-l-warning",
    medium: "",
    low: "",
};

export default function CommsPage() {
    const restricted = mockChannels.filter((c) => c.isRestricted).length;
    const totalMessages = mockChannels.reduce((s, c) => s + c.recentMessages, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Communications"
                description="Radio channel assignments, priority routing, and communication log"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Channels" value={mockChannels.length} icon={Radio} />
                <StatCard title="Restricted" value={restricted} icon={Lock} />
                <StatCard title="Messages (1hr)" value={totalMessages} icon={MessageSquare} />
                <StatCard title="Emergency Channel" value="CH 1" icon={Radio} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {mockChannels.map((ch, i) => (
                    <StaggerItem key={ch.id} index={i} stagger="tight">
                        <Card
                            className={`hover:shadow-sm transition-all border-l-2 ${PRIORITY_COLORS[ch.priority] ?? ""}`}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold bg-secondary px-1.5 py-0.5 rounded">
                                            CH {ch.channelNumber}
                                        </span>
                                        <h3 className="text-sm font-semibold">{ch.name}</h3>
                                    </div>
                                    <StatusBadge status={ch.priority} className="text-[10px]" />
                                </div>
                                <p className="text-[11px] text-muted-foreground mb-2">
                                    {ch.assignment}
                                </p>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-muted-foreground">
                                        {ch.recentMessages} messages
                                    </span>
                                    {ch.isRestricted && (
                                        <span className="flex items-center gap-0.5 text-warning">
                                            <Lock className="h-2.5 w-2.5" />
                                            Restricted
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </div>
        </div>
    );
}
