"use client";

import React from "react";
import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CALL_SHEET_STATUS_MAP } from "@/config/domain-config";
import { formatDate } from "@/lib/utils";
import {
    ArrowLeft, MapPin, Clock, Users, Phone, Cloud, Sun,
    Download, Send, AlertTriangle, CheckCircle2, Calendar,
} from "lucide-react";

const mockCallSheet = {
    id: "cs-001",
    title: "Air Max Launch — Day 1 Load-In",
    projectName: "Nike Air Max Launch Experience",
    status: "published" as const,
    date: "2026-03-13",
    venue: "Barclays Center, Brooklyn, NY",
    venueAddress: "620 Atlantic Ave, Brooklyn, NY 11217",
    callTime: "06:00",
    wrapTime: "18:00",
    weatherForecast: "Partly Cloudy, 48°F / 9°C, 15% chance of rain",
    productionNotes: "All crew must check in at loading dock entrance (Gate C). Hard hats required in rigging areas. Lunch break 12:00-12:45.",
    emergencyContact: "Sarah Chen (PM): +1 (212) 555-0142",
    parkingInstructions: "Crew parking at Atlantic Terminal Garage, Level P2. Validate at production office.",
    createdBy: "Sarah Chen",
    updatedAt: "2026-03-10",
};

interface CrewMember {
    id: string;
    name: string;
    role: string;
    department: string;
    callTime: string;
    phone: string;
    confirmed: boolean;
}

const mockCrew: CrewMember[] = [
    { id: "1", name: "Mike Johnson", role: "Technical Director", department: "Production", callTime: "06:00", phone: "+1 (212) 555-0101", confirmed: true },
    { id: "2", name: "Emily Rodriguez", role: "Stage Manager", department: "Production", callTime: "06:00", phone: "+1 (212) 555-0102", confirmed: true },
    { id: "3", name: "David Kim", role: "Lead Rigger", department: "Rigging", callTime: "06:30", phone: "+1 (212) 555-0103", confirmed: true },
    { id: "4", name: "Lisa Wang", role: "Lighting Designer", department: "Lighting", callTime: "07:00", phone: "+1 (212) 555-0104", confirmed: false },
    { id: "5", name: "James Brown", role: "Audio Engineer", department: "Audio", callTime: "07:00", phone: "+1 (212) 555-0105", confirmed: true },
    { id: "6", name: "Ana Petrova", role: "LED Tech", department: "Video", callTime: "08:00", phone: "+1 (212) 555-0106", confirmed: false },
    { id: "7", name: "Tom Harris", role: "Carpenter", department: "Scenic", callTime: "06:00", phone: "+1 (212) 555-0107", confirmed: true },
    { id: "8", name: "Rachel Green", role: "Props Master", department: "Scenic", callTime: "09:00", phone: "+1 (212) 555-0108", confirmed: true },
];

const mockSchedule = [
    { time: "06:00", activity: "Crew call — Loading dock opens", department: "All" },
    { time: "06:30", activity: "Rigging begins — Main stage points", department: "Rigging" },
    { time: "07:00", activity: "Lighting rig focus begins", department: "Lighting" },
    { time: "08:00", activity: "LED wall build begins (Stage Left)", department: "Video" },
    { time: "09:00", activity: "Scenic install — Stage facades", department: "Scenic" },
    { time: "10:00", activity: "Audio system fly + line check", department: "Audio" },
    { time: "12:00", activity: "LUNCH BREAK (45 min)", department: "All" },
    { time: "12:45", activity: "Resume — All departments", department: "All" },
    { time: "14:00", activity: "System integration test", department: "Production" },
    { time: "16:00", activity: "Walk-through with client", department: "Production" },
    { time: "17:30", activity: "Wrap prep — Secure all equipment", department: "All" },
    { time: "18:00", activity: "WRAP", department: "All" },
];

export default function CallSheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    void resolvedParams.id;

    const statusCfg = CALL_SHEET_STATUS_MAP[mockCallSheet.status];
    const confirmed = mockCrew.filter(c => c.confirmed).length;
    const departments = [...new Set(mockCrew.map(c => c.department))];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title={mockCallSheet.title} description={`${mockCallSheet.projectName} — ${formatDate(mockCallSheet.date)}`}>
                <div className="flex gap-2">
                    <Link href="/call-sheets"><Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>
                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />PDF</Button>
                    <Button size="sm"><Send className="mr-2 h-4 w-4" />Distribute</Button>
                </div>
            </PageHeader>

            {/* Header Info Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <Badge variant={statusCfg?.variant}>{statusCfg?.label}</Badge>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div><p className="text-[10px] text-muted-foreground">Date</p><p className="text-sm font-semibold">{formatDate(mockCallSheet.date)}</p></div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div><p className="text-[10px] text-muted-foreground">Call / Wrap</p><p className="text-sm font-semibold">{mockCallSheet.callTime} — {mockCallSheet.wrapTime}</p></div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div><p className="text-[10px] text-muted-foreground">Crew</p><p className="text-sm font-semibold">{confirmed}/{mockCrew.length} confirmed</p></div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <div><p className="text-[10px] text-muted-foreground">Weather</p><p className="text-xs font-medium">{mockCallSheet.weatherForecast}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Schedule */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" />Day Schedule</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {mockSchedule.map((entry, i) => (
                                    <div key={i} className={`flex items-start gap-3 p-2 rounded-lg ${entry.activity.includes("LUNCH") || entry.activity === "WRAP" ? "bg-warning/10 font-semibold" : "hover:bg-secondary/30"} transition-colors`}>
                                        <span className="text-sm font-mono font-bold w-14 shrink-0">{entry.time}</span>
                                        <span className="text-sm flex-1">{entry.activity}</span>
                                        <Badge variant="ghost" className="text-[10px] shrink-0">{entry.department}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Crew List by Department */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Crew List ({mockCrew.length})</CardTitle></CardHeader>
                        <CardContent>
                            {departments.map((dept) => (
                                <div key={dept} className="mb-4 last:mb-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{dept}</p>
                                    <div className="space-y-2">
                                        {mockCrew.filter(c => c.department === dept).map((member) => (
                                            <div key={member.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20">
                                                <div className="flex items-center gap-3">
                                                    {member.confirmed ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
                                                    <div>
                                                        <p className="text-sm font-semibold">{member.name}</p>
                                                        <p className="text-xs text-muted-foreground">{member.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{member.callTime}</span>
                                                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{member.phone}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" />Venue</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm font-semibold">{mockCallSheet.venue}</p>
                            <p className="text-xs text-muted-foreground">{mockCallSheet.venueAddress}</p>
                            <div className="h-32 bg-secondary/30 rounded-lg flex items-center justify-center">
                                <MapPin className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <p className="text-xs text-muted-foreground"><strong>Parking:</strong> {mockCallSheet.parkingInstructions}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Important</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                                <p className="text-xs font-semibold text-warning mb-1">Production Notes</p>
                                <p className="text-xs">{mockCallSheet.productionNotes}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                <p className="text-xs font-semibold text-destructive mb-1">Emergency Contact</p>
                                <p className="text-xs">{mockCallSheet.emergencyContact}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cloud className="h-4 w-4" />Weather</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Sun className="h-8 w-8 text-warning" />
                                <div>
                                    <p className="text-sm font-semibold">48°F / 9°C</p>
                                    <p className="text-xs text-muted-foreground">Partly Cloudy · 15% rain</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
