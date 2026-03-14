"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteTechSheet, useTechSheet, useUpdateTechSheet } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatDate } from "@/lib/utils";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import type { DetailPageConfig } from "@/types/detail-page-config";
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

function parseEquipment(raw: unknown): EquipmentItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((e) => ({
        id: String(e.id ?? ""),
        name: String(e.name ?? ""),
        category: String(e.category ?? ""),
        quantity: (e.quantity as number) ?? 0,
        specs: String(e.specs ?? ""),
        status: (e.status as EquipmentItem["status"]) ?? "pending",
    }));
}

function parsePowerCircuits(raw: unknown): PowerCircuit[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((c) => ({
        id: String(c.id ?? ""),
        label: String(c.label ?? ""),
        amperage: (c.amperage as number) ?? 0,
        voltage: (c.voltage as number) ?? 0,
        phase: String(c.phase ?? ""),
        department: String(c.department ?? ""),
    }));
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "tech-sheets",
    titleKey: "title",
    statusKey: "status",
    icon: Cpu,
    backHref: "/tech-sheets",
    backLabel: "Tech Sheets",
    chatter: false,
    fields: [],
    tabs: [],
};

export default function TechSheetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const sheetId = params.id as string;
    const { data: sbRecord, isLoading } = useTechSheet(sheetId);
    const ts = sbRecord as Record<string, unknown> | null;

    const projectName = (ts?.project_name as string) ?? "";
    const tsVenue = (ts?.venue as string) ?? (ts?.venue_name as string) ?? "";
    const tsDate = (ts?.date as string) ?? "";
    const totalPowerDraw = (ts?.total_power_draw as string) ?? "";
    const networkRequirements = (ts?.network_requirements as string) ?? "";
    const riggingPoints = (ts?.rigging_points as number) ?? 0;
    const maxRiggingWeight = (ts?.max_rigging_weight as string) ?? "";
    const createdBy = (ts?.created_by as string) ?? "";
    const approvedBy = (ts?.approved_by as string) ?? "";
    const updatedAt = (ts?.updated_at as string) ?? "";
    const equipment = parseEquipment(ts?.equipment);
    const powerCircuits = parsePowerCircuits(ts?.power_circuits);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: sheetId,
        entityLabel: "Tech Sheet",
        listPath: "/tech-sheets",
        useUpdateHook: useUpdateTechSheet,
        useDeleteHook: useDeleteTechSheet,
    });

    const categories = [...new Set(equipment.map((e) => e.category))];
    const confirmedItems = equipment.filter((e) => e.status === "confirmed").length;
    const totalAmps = powerCircuits.reduce((sum, c) => sum + c.amperage, 0);
    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);
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

    const sidebarSlot = (
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
                                {confirmedItems}/{equipment.length} confirmed
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Rigging</p>
                            <p className="text-sm font-semibold">{riggingPoints} points</p>
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
                        <span className="text-sm font-medium">{totalPowerDraw}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Network</span>
                        <span className="text-sm font-medium">{networkRequirements}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Rigging Points</span>
                        <span className="text-sm font-medium">{riggingPoints}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Max Weight/Point</span>
                        <span className="text-sm font-medium">{maxRiggingWeight}</span>
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
                            {tsDate ? formatDate(tsDate) : "—"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Created By</span>
                        <span className="text-sm font-medium">{createdBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Approved By</span>
                        <span className="text-sm font-medium">{approvedBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Last Updated</span>
                        <span className="text-sm font-medium">
                            {updatedAt ? formatDate(updatedAt) : "—"}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="py-4">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Quick Actions</p>
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleUpdate({ status: "sent" })}
                        >
                            <Send className="mr-2 h-3.5 w-3.5" />
                            Send to Venue
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => window.print()}
                        >
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Export PDF
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => `${projectName} — ${tsVenue}`,
        sidebarSlot,
        overviewSlot: (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        Equipment List ({equipment.length} items)
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
                                {equipment
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
        ),
        tabs: [
            {
                id: "power",
                label: "Power",
                count: powerCircuits.length,
                content: (
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
                                    {powerCircuits.map((circuit) => (
                                        <tr key={circuit.id} className="border-b border-border/50">
                                            <td className="py-2.5 font-medium">{circuit.label}</td>
                                            <td className="py-2.5 text-right">
                                                {circuit.amperage}A
                                            </td>
                                            <td className="py-2.5 text-right">
                                                {circuit.voltage}V
                                            </td>
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
                ),
            },
            {
                id: "chatter",
                label: "Chatter",
                content: (
                    <RecordChatter
                        recordType="tech_sheet"
                        recordId={sheetId}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={sheetId}
            record={ts}
            isLoading={isLoading}
            menuItems={[
                { label: "Download PDF", onClick: () => window.print() },
                {
                    label: "Duplicate Tech Sheet",
                    onClick: () => router.push(`/tech-sheets/new?duplicateFrom=${sheetId}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Cpu className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm" onClick={() => handleUpdate({ status: "sent" })}>
                    <Send className="h-4 w-4 mr-1" />
                    Send to Venue
                </Button>
            }
        />
    );
}
