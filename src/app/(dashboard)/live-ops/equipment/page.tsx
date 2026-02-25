"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Package, Search, CheckCircle2, AlertTriangle, Wrench } from "lucide-react";

interface MockEquipment {
    id: string;
    assetName: string;
    category: string;
    status: string;
    deployedLocation: string;
    department: string;
    conditionOnArrival: string;
    expectedQty: number;
    receivedQty: number;
}

const mockEquipment: MockEquipment[] = [
    { id: "1", assetName: "Allen & Heath SQ-7 Console", category: "Audio", status: "deployed", deployedLocation: "Main Stage FOH", department: "Audio", conditionOnArrival: "excellent", expectedQty: 1, receivedQty: 1 },
    { id: "2", assetName: "Robe MegaPointe (x12)", category: "Lighting", status: "deployed", deployedLocation: "Main Stage Truss", department: "Lighting", conditionOnArrival: "good", expectedQty: 12, receivedQty: 12 },
    { id: "3", assetName: "ROE CB5 LED Panels (x48)", category: "Video", status: "checked_in", deployedLocation: "Staging Area", department: "Video", conditionOnArrival: "good", expectedQty: 48, receivedQty: 48 },
    { id: "4", assetName: "CM Lodestar 1-Ton (x8)", category: "Rigging", status: "deployed", deployedLocation: "Grid", department: "Rigging", conditionOnArrival: "good", expectedQty: 8, receivedQty: 8 },
    { id: "5", assetName: "Barricade Sections (x20)", category: "Scenic", status: "deployed", deployedLocation: "FOH Perimeter", department: "FOH", conditionOnArrival: "fair", expectedQty: 20, receivedQty: 20 },
    { id: "6", assetName: "Wireless Mic Kit (Shure AD4Q)", category: "Audio", status: "issue_reported", deployedLocation: "Main Stage", department: "Audio", conditionOnArrival: "good", expectedQty: 4, receivedQty: 4 },
    { id: "7", assetName: "Follow Spot (x2)", category: "Lighting", status: "standby", deployedLocation: "FOH Platform", department: "Lighting", conditionOnArrival: "excellent", expectedQty: 2, receivedQty: 2 },
    { id: "8", assetName: "Generator — 400A", category: "Power", status: "deployed", deployedLocation: "Power Compound", department: "Technical", conditionOnArrival: "good", expectedQty: 1, receivedQty: 1 },
];

export default function EquipmentPage() {
    const [search, setSearch] = useState("");

    const deployed = mockEquipment.filter(e => e.status === "deployed").length;
    const issues = mockEquipment.filter(e => ["issue_reported", "failed", "being_repaired"].includes(e.status)).length;
    const totalItems = mockEquipment.reduce((s, e) => s + e.receivedQty, 0);

    const filtered = mockEquipment.filter(e =>
        !search || e.assetName.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Equipment Check-Ins" description="On-site equipment status, deployment tracking, and condition monitoring" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Items" value={totalItems} icon={Package} />
                <StatCard title="Deployed" value={deployed} icon={CheckCircle2} />
                <StatCard title="Issues" value={issues} icon={AlertTriangle} />
                <StatCard title="Categories" value={new Set(mockEquipment.map(e => e.category)).size} icon={Wrench} />
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>

            <div className="space-y-2">
                {filtered.map((item, i) => (
                    <Card key={item.id} className={`hover:shadow-sm transition-all animate-slide-up ${["issue_reported", "failed"].includes(item.status) ? "border-l-2 border-l-warning" : ""}`} style={{ animationDelay: `${i * 30}ms` }}>
                        <CardContent className="py-3">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold truncate">{item.assetName}</h3>
                                        <StatusBadge status={item.status} className="text-[10px] shrink-0" />
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                        <span>{item.category}</span>
                                        <span>{item.deployedLocation}</span>
                                        <span>Condition: {item.conditionOnArrival}</span>
                                    </div>
                                </div>
                                <div className="text-right text-sm shrink-0">
                                    <p className="font-medium">{item.receivedQty}/{item.expectedQty}</p>
                                    <p className="text-[10px] text-muted-foreground">received</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
