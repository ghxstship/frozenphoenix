"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { CALL_SHEET_STATUS_MAP, type CallSheetStatusType } from "@/config/domain-config";
import { formatDate } from "@/lib/utils";
import {
    ClipboardList, Plus, Search, MapPin, Clock, Users,
    Calendar, Sun, Send, CheckCircle2,
} from "lucide-react";

interface CallSheetListItem {
    id: string;
    title: string;
    callSheetNumber: string;
    projectName: string;
    date: string;
    venueName: string;
    generalCallTime: string;
    wrapTime: string;
    crewCount: number;
    status: CallSheetStatusType;
    weatherForecast: string;
    weatherTemp: string;
}

const mockCallSheets: CallSheetListItem[] = [
    { id: "1", title: "Nike Air Max Launch — Day 1", callSheetNumber: "CS-2026-0001", projectName: "Nike Air Max Launch", date: "2026-03-15", venueName: "Barclays Center, Brooklyn", generalCallTime: "06:00", wrapTime: "22:00", crewCount: 45, status: "distributed", weatherForecast: "Partly Cloudy", weatherTemp: "58°F" },
    { id: "2", title: "Nike Air Max Launch — Day 2", callSheetNumber: "CS-2026-0002", projectName: "Nike Air Max Launch", date: "2026-03-16", venueName: "Barclays Center, Brooklyn", generalCallTime: "07:00", wrapTime: "20:00", crewCount: 38, status: "published", weatherForecast: "Sunny", weatherTemp: "62°F" },
    { id: "3", title: "Red Bull Festival — Load In", callSheetNumber: "CS-2026-0003", projectName: "Red Bull Festival Activation", date: "2026-04-10", venueName: "Randalls Island Park", generalCallTime: "05:00", wrapTime: "18:00", crewCount: 60, status: "draft", weatherForecast: "Clear", weatherTemp: "55°F" },
    { id: "4", title: "Coachella Stage Build — Week 1", callSheetNumber: "CS-2026-0004", projectName: "Coachella Brand Experience", date: "2026-04-01", venueName: "Empire Polo Club, Indio", generalCallTime: "06:00", wrapTime: "19:00", crewCount: 85, status: "draft", weatherForecast: "Hot & Dry", weatherTemp: "92°F" },
    { id: "5", title: "TechStart Launch — Setup", callSheetNumber: "CS-2026-0005", projectName: "TechStart Product Launch", date: "2026-03-20", venueName: "Javits Center, NYC", generalCallTime: "08:00", wrapTime: "17:00", crewCount: 22, status: "acknowledged", weatherForecast: "Rain", weatherTemp: "48°F" },
];

export default function CallSheetsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filtered = mockCallSheets.filter((cs) => {
        const matchesSearch =
            cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cs.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cs.venueName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || cs.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalCrew = mockCallSheets.reduce((sum, cs) => sum + cs.crewCount, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Call Sheets" description="Generate and distribute daily call sheets for crew and production teams">
                <Button><Plus className="mr-2 h-4 w-4" />New Call Sheet</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Call Sheets" value={mockCallSheets.length} icon={ClipboardList} />
                <StatCard title="Distributed" value={mockCallSheets.filter(cs => cs.status === "distributed").length} icon={Send} />
                <StatCard title="Acknowledged" value={mockCallSheets.filter(cs => cs.status === "acknowledged").length} icon={CheckCircle2} />
                <StatCard title="Total Crew" value={totalCrew} description="across all sheets" icon={Users} />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search call sheets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["all", "draft", "published", "distributed", "acknowledged", "archived"].map((s) => (
                        <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
                            {s === "all" ? "All" : CALL_SHEET_STATUS_MAP[s as CallSheetStatusType]?.label ?? s}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filtered.map((cs, i) => {
                    const statusCfg = CALL_SHEET_STATUS_MAP[cs.status];
                    return (
                        <Link key={cs.id} href={`/call-sheets/${cs.id}`}>
                            <Card className="cursor-pointer hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                                <CardContent className="py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <ClipboardList className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono text-muted-foreground">{cs.callSheetNumber}</span>
                                                    <Badge variant={statusCfg?.variant}>{statusCfg?.label}</Badge>
                                                </div>
                                                <h3 className="text-sm font-semibold mt-1">{cs.title}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(cs.date)}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{cs.venueName}</span>
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Call: {cs.generalCallTime} — Wrap: {cs.wrapTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 space-y-1">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                                                <Users className="h-3 w-3" />
                                                <span className="font-semibold text-foreground">{cs.crewCount}</span> crew
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                                                <Sun className="h-3 w-3" />
                                                {cs.weatherTemp} · {cs.weatherForecast}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No call sheets found</h3>
                        <p className="text-muted-foreground text-center">
                            {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "Create your first call sheet to get started"}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
