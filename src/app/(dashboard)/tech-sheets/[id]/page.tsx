"use client";

import React from "react";
import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TECH_SHEET_STATUS_MAP } from "@/config/domain-config";
import { formatDate } from "@/lib/utils";
import {
    ArrowLeft, Cpu, Zap, Wifi, Monitor, Speaker, Lightbulb,
    Download, Send, AlertTriangle, CheckCircle2, Server,
} from "lucide-react";

interface EquipmentItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    specs: string;
    status: "confirmed" | "pending" | "unavailable";
}

interface PowerCircuit {
    id: string;
    label: string;
    amperage: number;
    voltage: number;
    phase: string;
    department: string;
}

const mockTechSheet = {
    id: "ts-001",
    title: "Air Max Launch — Technical Rider",
    projectName: "Nike Air Max Launch Experience",
    venue: "Barclays Center, Brooklyn, NY",
    status: "approved" as const,
    date: "2026-03-13",
    totalPowerDraw: "480A @ 208V 3-Phase",
    networkRequirements: "Dedicated 1Gbps fiber + backup LTE",
    riggingPoints: 24,
    maxRiggingWeight: "2,400 lbs per point",
    createdBy: "Mike Johnson",
    approvedBy: "Technical Director",
    updatedAt: "2026-03-08",
};

const mockEquipment: EquipmentItem[] = [
    { id: "1", name: "ROE CB5 LED Panel", category: "Video", quantity: 50, specs: "2.5mm pixel pitch, 500x500mm, HDR", status: "confirmed" },
    { id: "2", name: "Novastar MCTRL4K Processor", category: "Video", quantity: 2, specs: "4K input, 16 output ports", status: "confirmed" },
    { id: "3", name: "Martin MAC Aura XB", category: "Lighting", quantity: 32, specs: "Wash, RGBW, 1170 lumen", status: "confirmed" },
    { id: "4", name: "Robe MegaPointe", category: "Lighting", quantity: 16, specs: "Beam/spot/wash, 11,000 lumen", status: "pending" },
    { id: "5", name: "d&b audiotechnik SL-Series", category: "Audio", quantity: 24, specs: "Line array, 145 dB SPL max", status: "confirmed" },
    { id: "6", name: "d&b SL-Sub", category: "Audio", quantity: 12, specs: "Cardioid sub, 21\" driver", status: "confirmed" },
    { id: "7", name: "DiGiCo SD7 Console", category: "Audio", quantity: 1, specs: "FOH console, 128 channels", status: "confirmed" },
    { id: "8", name: "grandMA3 Full-Size", category: "Lighting", quantity: 2, specs: "Lighting control, 250K params", status: "confirmed" },
    { id: "9", name: "CM Lodestar 1-Ton", category: "Rigging", quantity: 24, specs: "1-ton capacity, 60 fpm", status: "confirmed" },
    { id: "10", name: "Cisco Catalyst 9300", category: "Network", quantity: 4, specs: "48-port PoE+, 10G uplink", status: "pending" },
];

const mockPowerCircuits: PowerCircuit[] = [
    { id: "1", label: "LED Wall Main", amperage: 200, voltage: 208, phase: "3-Phase", department: "Video" },
    { id: "2", label: "Lighting Rig", amperage: 150, voltage: 208, phase: "3-Phase", department: "Lighting" },
    { id: "3", label: "Audio FOH + Amps", amperage: 60, voltage: 208, phase: "3-Phase", department: "Audio" },
    { id: "4", label: "Network + Control", amperage: 30, voltage: 120, phase: "Single", department: "IT" },
    { id: "5", label: "Scenic Motors", amperage: 40, voltage: 208, phase: "3-Phase", department: "Scenic" },
];

export default function TechSheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    void resolvedParams.id;

    const statusCfg = TECH_SHEET_STATUS_MAP[mockTechSheet.status];
    const categories = [...new Set(mockEquipment.map(e => e.category))];
    const confirmedItems = mockEquipment.filter(e => e.status === "confirmed").length;
    const totalAmps = mockPowerCircuits.reduce((sum, c) => sum + c.amperage, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title={mockTechSheet.title} description={`${mockTechSheet.projectName} — ${mockTechSheet.venue}`}>
                <div className="flex gap-2">
                    <Link href="/tech-sheets"><Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>
                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />PDF</Button>
                    <Button size="sm"><Send className="mr-2 h-4 w-4" />Send to Venue</Button>
                </div>
            </PageHeader>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <Badge variant={statusCfg?.variant}>{statusCfg?.label}</Badge>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-warning" />
                    <div><p className="text-[10px] text-muted-foreground">Total Power</p><p className="text-sm font-semibold">{totalAmps}A</p></div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-info" />
                    <div><p className="text-[10px] text-muted-foreground">Equipment</p><p className="text-sm font-semibold">{confirmedItems}/{mockEquipment.length} confirmed</p></div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <div><p className="text-[10px] text-muted-foreground">Rigging</p><p className="text-sm font-semibold">{mockTechSheet.riggingPoints} points</p></div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-success" />
                    <div><p className="text-[10px] text-muted-foreground">Network</p><p className="text-xs font-medium">1Gbps + LTE</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Equipment List by Category */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cpu className="h-4 w-4" />Equipment List ({mockEquipment.length} items)</CardTitle></CardHeader>
                        <CardContent>
                            {categories.map((cat) => (
                                <div key={cat} className="mb-4 last:mb-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                                        {cat === "Video" && <Monitor className="h-3 w-3" />}
                                        {cat === "Lighting" && <Lightbulb className="h-3 w-3" />}
                                        {cat === "Audio" && <Speaker className="h-3 w-3" />}
                                        {cat === "Rigging" && <Server className="h-3 w-3" />}
                                        {cat === "Network" && <Wifi className="h-3 w-3" />}
                                        {cat}
                                    </p>
                                    <div className="space-y-2">
                                        {mockEquipment.filter(e => e.category === cat).map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20">
                                                <div className="flex items-center gap-3">
                                                    {item.status === "confirmed" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
                                                    <div>
                                                        <p className="text-sm font-semibold">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground">{item.specs}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold">×{item.quantity}</span>
                                                    <Badge variant={item.status === "confirmed" ? "success" : item.status === "pending" ? "warning" : "destructive"} className="text-[10px]">
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Power Distribution */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" />Power Distribution</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="text-left py-2 font-medium">Circuit</th>
                                        <th className="text-right py-2 font-medium">Amps</th>
                                        <th className="text-right py-2 font-medium">Voltage</th>
                                        <th className="text-right py-2 font-medium">Phase</th>
                                        <th className="text-right py-2 font-medium">Dept</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockPowerCircuits.map((circuit) => (
                                        <tr key={circuit.id} className="border-b border-border/50">
                                            <td className="py-2.5 font-medium">{circuit.label}</td>
                                            <td className="py-2.5 text-right">{circuit.amperage}A</td>
                                            <td className="py-2.5 text-right">{circuit.voltage}V</td>
                                            <td className="py-2.5 text-right">{circuit.phase}</td>
                                            <td className="py-2.5 text-right"><Badge variant="ghost" className="text-[10px]">{circuit.department}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td className="py-2 font-bold">Total</td>
                                        <td className="py-2 text-right font-bold">{totalAmps}A</td>
                                        <td colSpan={3}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Technical Specs</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Total Power Draw</span><span className="text-sm font-medium">{mockTechSheet.totalPowerDraw}</span></div>
                            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Network</span><span className="text-sm font-medium">{mockTechSheet.networkRequirements}</span></div>
                            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Rigging Points</span><span className="text-sm font-medium">{mockTechSheet.riggingPoints}</span></div>
                            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Max Weight/Point</span><span className="text-sm font-medium">{mockTechSheet.maxRiggingWeight}</span></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Metadata</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Date</span><span className="text-sm font-medium">{formatDate(mockTechSheet.date)}</span></div>
                            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Created By</span><span className="text-sm font-medium">{mockTechSheet.createdBy}</span></div>
                            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Approved By</span><span className="text-sm font-medium">{mockTechSheet.approvedBy}</span></div>
                            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Last Updated</span><span className="text-sm font-medium">{formatDate(mockTechSheet.updatedAt)}</span></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-4">
                            <p className="text-xs text-muted-foreground font-medium mb-2">Quick Actions</p>
                            <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start"><Send className="mr-2 h-3.5 w-3.5" />Send to Venue</Button>
                                <Button variant="outline" size="sm" className="w-full justify-start"><Download className="mr-2 h-3.5 w-3.5" />Export PDF</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
