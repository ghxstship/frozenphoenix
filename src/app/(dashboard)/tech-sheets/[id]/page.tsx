"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatDate } from "@/lib/utils";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import {
    AlertTriangle,
    CheckCircle2,
    Cpu,
    Download,
    Lightbulb,
    Monitor,
    Send,
    Server,
    Speaker,
    Wifi,
    Zap,
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
    {
        id: "1",
        name: "ROE CB5 LED Panel",
        category: "Video",
        quantity: 50,
        specs: "2.5mm pixel pitch, 500x500mm, HDR",
        status: "confirmed",
    },
    {
        id: "2",
        name: "Novastar MCTRL4K Processor",
        category: "Video",
        quantity: 2,
        specs: "4K input, 16 output ports",
        status: "confirmed",
    },
    {
        id: "3",
        name: "Martin MAC Aura XB",
        category: "Lighting",
        quantity: 32,
        specs: "Wash, RGBW, 1170 lumen",
        status: "confirmed",
    },
    {
        id: "4",
        name: "Robe MegaPointe",
        category: "Lighting",
        quantity: 16,
        specs: "Beam/spot/wash, 11,000 lumen",
        status: "pending",
    },
    {
        id: "5",
        name: "d&b audiotechnik SL-Series",
        category: "Audio",
        quantity: 24,
        specs: "Line array, 145 dB SPL max",
        status: "confirmed",
    },
    {
        id: "6",
        name: "d&b SL-Sub",
        category: "Audio",
        quantity: 12,
        specs: 'Cardioid sub, 21" driver',
        status: "confirmed",
    },
    {
        id: "7",
        name: "DiGiCo SD7 Console",
        category: "Audio",
        quantity: 1,
        specs: "FOH console, 128 channels",
        status: "confirmed",
    },
    {
        id: "8",
        name: "grandMA3 Full-Size",
        category: "Lighting",
        quantity: 2,
        specs: "Lighting control, 250K params",
        status: "confirmed",
    },
    {
        id: "9",
        name: "CM Lodestar 1-Ton",
        category: "Rigging",
        quantity: 24,
        specs: "1-ton capacity, 60 fpm",
        status: "confirmed",
    },
    {
        id: "10",
        name: "Cisco Catalyst 9300",
        category: "Network",
        quantity: 4,
        specs: "48-port PoE+, 10G uplink",
        status: "pending",
    },
];

const mockPowerCircuits: PowerCircuit[] = [
    {
        id: "1",
        label: "LED Wall Main",
        amperage: 200,
        voltage: 208,
        phase: "3-Phase",
        department: "Video",
    },
    {
        id: "2",
        label: "Lighting Rig",
        amperage: 150,
        voltage: 208,
        phase: "3-Phase",
        department: "Lighting",
    },
    {
        id: "3",
        label: "Audio FOH + Amps",
        amperage: 60,
        voltage: 208,
        phase: "3-Phase",
        department: "Audio",
    },
    {
        id: "4",
        label: "Network + Control",
        amperage: 30,
        voltage: 120,
        phase: "Single",
        department: "IT",
    },
    {
        id: "5",
        label: "Scenic Motors",
        amperage: 40,
        voltage: 208,
        phase: "3-Phase",
        department: "Scenic",
    },
];

type TechSheetTabId = "equipment" | "power" | "chatter";
const TECH_SHEET_TAB_VALUES = ["equipment", "power", "chatter"] as const;

export default function TechSheetDetailPage() {
    const params = useParams();
    const sheetId = params.id as string;
    void sheetId;

    const [activeTab, setActiveTab] = useQueryTabState<TechSheetTabId>({
        key: "tab",
        defaultValue: "equipment",
        validValues: TECH_SHEET_TAB_VALUES,
    });

    const categories = [...new Set(mockEquipment.map((e) => e.category))];
    const confirmedItems = mockEquipment.filter((e) => e.status === "confirmed").length;
    const totalAmps = mockPowerCircuits.reduce((sum, c) => sum + c.amperage, 0);
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());
    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Sarah Chen",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const tabs = [
        { id: "equipment" as const, label: "Equipment", count: mockEquipment.length },
        { id: "power" as const, label: "Power", count: mockPowerCircuits.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            {/* Overview Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">At a Glance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-warning" />
                        <div>
                            <p className="text-xs text-muted-foreground">Total Power</p>
                            <p className="text-sm font-semibold">{totalAmps}A</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-info" />
                        <div>
                            <p className="text-xs text-muted-foreground">Equipment</p>
                            <p className="text-sm font-semibold">
                                {confirmedItems}/{mockEquipment.length} confirmed
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Rigging</p>
                            <p className="text-sm font-semibold">
                                {mockTechSheet.riggingPoints} points
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-success" />
                        <div>
                            <p className="text-xs text-muted-foreground">Network</p>
                            <p className="text-xs font-medium">1Gbps + LTE</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Technical Specs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Total Power Draw</span>
                        <span className="text-sm font-medium">{mockTechSheet.totalPowerDraw}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Network</span>
                        <span className="text-sm font-medium">
                            {mockTechSheet.networkRequirements}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Rigging Points</span>
                        <span className="text-sm font-medium">{mockTechSheet.riggingPoints}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Max Weight/Point</span>
                        <span className="text-sm font-medium">
                            {mockTechSheet.maxRiggingWeight}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Date</span>
                        <span className="text-sm font-medium">
                            {formatDate(mockTechSheet.date)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Created By</span>
                        <span className="text-sm font-medium">{mockTechSheet.createdBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Approved By</span>
                        <span className="text-sm font-medium">{mockTechSheet.approvedBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Last Updated</span>
                        <span className="text-sm font-medium">
                            {formatDate(mockTechSheet.updatedAt)}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="py-4">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Quick Actions</p>
                    <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Send className="mr-2 h-3.5 w-3.5" />
                            Send to Venue
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Export PDF
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/tech-sheets"
            backLabel="Tech Sheets"
            title={mockTechSheet.title}
            subtitle={`${mockTechSheet.projectName} — ${mockTechSheet.venue}`}
            status={mockTechSheet.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Cpu className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm">
                    <Send className="h-4 w-4 mr-1" />
                    Send to Venue
                </Button>
            }
            menuItems={[
                { label: "Download PDF", onClick: () => {} },
                { label: "Duplicate Tech Sheet", onClick: () => {} },
                { label: "Archive", onClick: () => {}, variant: "destructive" },
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TechSheetTabId)}
            sidebar={sidebar}
        >
            {activeTab === "equipment" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Cpu className="h-4 w-4" />
                            Equipment List ({mockEquipment.length} items)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categories.map((cat) => (
                            <div key={cat} className="mb-4 last:mb-0">
                                <OverlineText className="mb-2 flex items-center gap-1">
                                    {cat === "Video" && <Monitor className="h-3 w-3" />}
                                    {cat === "Lighting" && <Lightbulb className="h-3 w-3" />}
                                    {cat === "Audio" && <Speaker className="h-3 w-3" />}
                                    {cat === "Rigging" && <Server className="h-3 w-3" />}
                                    {cat === "Network" && <Wifi className="h-3 w-3" />}
                                    {cat}
                                </OverlineText>
                                <div className="space-y-2">
                                    {mockEquipment
                                        .filter((e) => e.category === cat)
                                        .map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.status === "confirmed" ? (
                                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                                    ) : (
                                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-semibold">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.specs}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold">
                                                        ×{item.quantity}
                                                    </span>
                                                    <Badge
                                                        variant={getStatusVariant(item.status)}
                                                        className="text-[10px]"
                                                    >
                                                        {getStatusLabel(item.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {activeTab === "power" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Power Distribution
                        </CardTitle>
                    </CardHeader>
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
                                        <td className="py-2.5 text-right">
                                            <Badge variant="ghost" className="text-[10px]">
                                                {circuit.department}
                                            </Badge>
                                        </td>
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
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="tech_sheet"
                    recordId={mockTechSheet.id}
                    activityItems={makeMockActivity("tech_sheet")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
