"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { LoadingState } from "@/components/layouts/loading-state";
import { AlertTriangle, CheckCircle2, Clock, Users } from "lucide-react";
import { useLiveCrewAssignments } from "@/lib/supabase/hooks-live-ops";

export default function LiveCrewPage() {
    const [search, setSearch] = useState("");
    const { data: crew, isLoading } = useLiveCrewAssignments();

    if (isLoading) return <LoadingState />;

    const rows = crew ?? [];
    const checkedIn = rows.filter((c) => !!c.checked_in_at).length;
    const overtime = rows.filter((c) => c.overtime_flagged).length;
    const totalHours = rows.reduce((s, c) => s + (c.hours_worked ?? 0), 0);

    const filtered = rows.filter(
        (c) =>
            !search ||
            (c.role_description ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (c.department ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Live Crew"
                description="On-site crew assignments, check-in status, and overtime tracking"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Checked In"
                    value={`${checkedIn}/${rows.length}`}
                    icon={CheckCircle2}
                />
                <StatCard title="Overtime Flagged" value={overtime} icon={AlertTriangle} />
                <StatCard title="Total Hours Today" value={totalHours.toFixed(1)} icon={Clock} />
                <StatCard title="Total Crew" value={rows.length} icon={Users} />
            </div>

            <SearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search crew..."
                className="max-w-sm"
            />

            <div className="space-y-2">
                {filtered.map((member, i) => (
                    <StaggerItem key={member.id} index={i} stagger="tight">
                        <Card
                            className={`hover:shadow-sm transition-all ${member.overtime_flagged ? "border-l-2 border-l-warning" : ""}`}
                        >
                            <CardContent className="py-3">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold">
                                        {member.radio_callsign ?? "—"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold truncate">
                                                {member.crew_member_id}
                                            </h3>
                                            <StatusBadge
                                                status={member.checked_in_at ? "checked_in" : "not_checked_in"}
                                                className="text-[10px] shrink-0"
                                            />
                                            {member.overtime_flagged && (
                                                <span className="text-[10px] text-warning font-medium shrink-0 flex items-center gap-0.5">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    OT
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {member.role_description ?? ""} · {member.department ?? ""} · {member.zone ?? ""}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm shrink-0">
                                        <p className="font-medium">{member.hours_worked ?? 0}h</p>
                                        {member.checked_in_at && (
                                            <p className="text-[10px] text-muted-foreground">
                                                In: {new Date(member.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
