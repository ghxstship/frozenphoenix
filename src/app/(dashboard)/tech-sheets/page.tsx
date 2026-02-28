"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { TECH_SHEET_STATUS_MAP, type TechSheetStatusType } from "@/config/domain-config";
import { formatDate } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    Cpu, Plus, MapPin, Zap, Wifi,
    CheckCircle2, FileText, Shield,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

interface TechSheetListItem {
    id: string;
    title: string;
    techSheetNumber: string;
    projectName: string;
    venueName: string;
    version: number;
    status: TechSheetStatusType;
    totalAmperage: number;
    generatorRequired: boolean;
    internetRequired: boolean;
    equipmentCount: number;
    createdAt: string;
}

const mockTechSheets: TechSheetListItem[] = [
    { id: "1", title: "Nike Air Max — Barclays Center Tech Rider", techSheetNumber: "TS-2026-0001", projectName: "Nike Air Max Launch", venueName: "Barclays Center, Brooklyn", version: 3, status: "approved", totalAmperage: 400, generatorRequired: false, internetRequired: true, equipmentCount: 48, createdAt: "2026-02-10" },
    { id: "2", title: "Red Bull Festival — Main Stage", techSheetNumber: "TS-2026-0002", projectName: "Red Bull Festival Activation", venueName: "Randalls Island Park", version: 2, status: "reviewed", totalAmperage: 800, generatorRequired: true, internetRequired: true, equipmentCount: 92, createdAt: "2026-03-01" },
    { id: "3", title: "Coachella — Brand Experience Pavilion", techSheetNumber: "TS-2026-0003", projectName: "Coachella Brand Experience", venueName: "Empire Polo Club, Indio", version: 1, status: "draft", totalAmperage: 1200, generatorRequired: true, internetRequired: true, equipmentCount: 156, createdAt: "2026-02-28" },
    { id: "4", title: "TechStart — Javits Center Booth", techSheetNumber: "TS-2026-0004", projectName: "TechStart Product Launch", venueName: "Javits Center, NYC", version: 1, status: "distributed", totalAmperage: 200, generatorRequired: false, internetRequired: true, equipmentCount: 24, createdAt: "2026-03-05" },
    { id: "5", title: "Corporate Gala — Lighting Package", techSheetNumber: "TS-2026-0005", projectName: "Momentum Corporate Gala", venueName: "The Plaza, NYC", version: 2, status: "approved", totalAmperage: 300, generatorRequired: false, internetRequired: false, equipmentCount: 35, createdAt: "2026-01-20" },
];

export default function TechSheetsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filtered = mockTechSheets.filter((ts) => {
        const matchesSearch =
            ts.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ts.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ts.venueName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || ts.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalEquipment = mockTechSheets.reduce((sum, ts) => sum + ts.equipmentCount, 0);

    return (
        <PermissionGate resource="tech_sheets" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Tech Sheets" description="Technical riders and equipment specifications for venues and events">
                <Button><Plus className="mr-2 h-4 w-4" />New Tech Sheet</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Tech Sheets" value={mockTechSheets.length} icon={Cpu} />
                <StatCard title="Approved" value={mockTechSheets.filter(ts => ts.status === "approved").length} icon={CheckCircle2} />
                <StatCard title="Equipment Items" value={totalEquipment} icon={FileText} />
                <StatCard title="Generator Req." value={mockTechSheets.filter(ts => ts.generatorRequired).length} icon={Zap} />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search tech sheets..." className="flex-1 max-w-sm" />
                <div className="flex gap-2 flex-wrap">
                    {["all", "draft", "reviewed", "approved", "distributed", "archived"].map((s) => (
                        <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
                            {s === "all" ? "All" : TECH_SHEET_STATUS_MAP[s as TechSheetStatusType]?.label ?? s}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filtered.map((ts, i) => {
                    const statusCfg = TECH_SHEET_STATUS_MAP[ts.status];
                    return (
                        <StaggerItem key={ts.id} index={i} stagger="relaxed">
                        <Link href={`/tech-sheets/${ts.id}`}>
                            <Card className="cursor-pointer hover:shadow-md transition-all">
                                <CardContent className="py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Cpu className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono text-muted-foreground">{ts.techSheetNumber}</span>
                                                    <Badge variant={statusCfg?.variant}>{statusCfg?.label}</Badge>
                                                    <Badge variant="ghost">v{ts.version}</Badge>
                                                </div>
                                                <h3 className="text-sm font-semibold mt-1">{ts.title}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ts.venueName}</span>
                                                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{ts.equipmentCount} items</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 space-y-1">
                                            <div className="flex items-center gap-2 justify-end flex-wrap">
                                                <Badge variant={ts.generatorRequired ? "warning" : "ghost"} className="text-[10px]">
                                                    <Zap className="mr-1 h-3 w-3" />{ts.totalAmperage}A
                                                </Badge>
                                                {ts.internetRequired && (
                                                    <Badge variant="info" className="text-[10px]">
                                                        <Wifi className="mr-1 h-3 w-3" />Network
                                                    </Badge>
                                                )}
                                                {ts.generatorRequired && (
                                                    <Badge variant="warning" className="text-[10px]">
                                                        <Shield className="mr-1 h-3 w-3" />Generator
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">{formatDate(ts.createdAt)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        </StaggerItem>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Cpu className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No tech sheets found</h3>
                        <p className="text-muted-foreground text-center">
                            {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "Create your first tech sheet to get started"}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
        </PermissionGate>
    );
}
