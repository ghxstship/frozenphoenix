"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallSheet, useDeleteCallSheet, useUpdateCallSheet } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    Cloud,
    Download,
    MapPin,
    Phone,
    Send,
    Sun,
    Users,
} from "lucide-react";

interface CrewMember {
    id: string;
    name: string;
    role: string;
    department: string;
    callTime: string;
    phone: string;
    confirmed: boolean;
}

interface ScheduleEntry {
    time: string;
    activity: string;
    department: string;
}

function parseCrew(raw: unknown): CrewMember[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((c) => ({
        id: String(c.id ?? ""),
        name: String(c.name ?? ""),
        role: String(c.role ?? ""),
        department: String(c.department ?? ""),
        callTime: String(c.call_time ?? c.callTime ?? ""),
        phone: String(c.phone ?? ""),
        confirmed: Boolean(c.confirmed),
    }));
}

function parseSchedule(raw: unknown): ScheduleEntry[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((s) => ({
        time: String(s.time ?? ""),
        activity: String(s.activity ?? ""),
        department: String(s.department ?? ""),
    }));
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "call-sheets",
    titleKey: "title",
    statusKey: "status",
    icon: Calendar,
    backHref: "/call-sheets",
    backLabel: "Call Sheets",
    chatterRecordType: "call_sheet",
    fields: [],
    tabs: [],
};

export default function CallSheetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord, isLoading } = useCallSheet(entityId);
    const cs = sbRecord as Record<string, unknown> | null;

    const projectName = (cs?.project_name as string) ?? "";
    const csDate = (cs?.date as string) ?? "";
    const venue = (cs?.venue as string) ?? "";
    const venueAddress = (cs?.venue_address as string) ?? "";
    const callTime = (cs?.call_time as string) ?? "";
    const wrapTime = (cs?.wrap_time as string) ?? "";
    const productionNotes = (cs?.production_notes as string) ?? "";
    const emergencyContact = (cs?.emergency_contact as string) ?? "";
    const parkingInstructions = (cs?.parking_instructions as string) ?? "";
    const crew = parseCrew(cs?.crew);
    const schedule = parseSchedule(cs?.schedule);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Call Sheet",
        listPath: "/call-sheets",
        useUpdateHook: useUpdateCallSheet,
        useDeleteHook: useDeleteCallSheet,
    });
    const confirmed = crew.filter((c) => c.confirmed).length;
    const departments = [...new Set(crew.map((c) => c.department))];

    const sidebarSlot = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">At a Glance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="font-medium">{csDate ? formatDate(csDate) : "—"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Call / Wrap</p>
                            <p className="font-medium">
                                {callTime} — {wrapTime}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Crew</p>
                            <p className="font-medium">
                                {confirmed}/{crew.length} confirmed
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Venue
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm font-semibold">{venue}</p>
                    <p className="text-xs text-muted-foreground">{venueAddress}</p>
                    <div className="h-32 bg-secondary/30 rounded-lg flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <strong>Parking:</strong> {parkingInstructions}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Important
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-xs font-semibold text-warning mb-1">Production Notes</p>
                        <p className="text-xs">{productionNotes}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs font-semibold text-destructive mb-1">
                            Emergency Contact
                        </p>
                        <p className="text-xs">{emergencyContact}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        Weather
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <Sun className="h-8 w-8 text-warning" />
                        <div>
                            <p className="text-sm font-semibold">48°F / 9°C</p>
                            <p className="text-xs text-muted-foreground">
                                Partly Cloudy · 15% rain
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.print()}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleUpdate({ status: "distributed" })}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Distribute
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => `${projectName} — ${csDate ? formatDate(csDate) : ""}`,
        sidebarSlot,
        tabs: [
            {
                id: "schedule",
                label: "Schedule",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Day Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {schedule.map((entry, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-start gap-3 p-2 rounded-lg ${entry.activity.includes("LUNCH") || entry.activity === "WRAP" ? "bg-warning/10 font-semibold" : "hover:bg-secondary/30"} transition-colors`}
                                    >
                                        <span className="text-sm font-mono font-bold w-14 shrink-0">
                                            {entry.time}
                                        </span>
                                        <span className="text-sm flex-1">{entry.activity}</span>
                                        <Badge variant="ghost" className="text-[10px] shrink-0">
                                            {entry.department}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "crew",
                label: "Crew",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Crew List ({crew.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {departments.map((dept) => (
                                <div key={dept} className="mb-4 last:mb-0">
                                    <OverlineText className="mb-2">{dept}</OverlineText>
                                    <div className="space-y-2">
                                        {crew
                                            .filter((c) => c.department === dept)
                                            .map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {member.confirmed ? (
                                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                                        ) : (
                                                            <AlertTriangle className="h-4 w-4 text-warning" />
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-semibold">
                                                                {member.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {member.role}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {member.callTime}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {member.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={entityId}
            record={cs}
            isLoading={isLoading}
            menuItems={[
                { label: "Download PDF", onClick: () => window.print() },
                {
                    label: "Duplicate Call Sheet",
                    onClick: () => router.push(`/call-sheets/new?duplicateFrom=${entityId}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Calendar className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm">
                    <Send className="h-4 w-4 mr-1" />
                    Distribute
                </Button>
            }
        />
    );
}
