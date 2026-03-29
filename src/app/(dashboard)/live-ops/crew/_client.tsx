"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { AlertTriangle, CheckCircle2, Clock, Coffee, LogIn, LogOut, Users } from "lucide-react";
import { useLiveCrewAssignments, useUpdateLiveCrewAssignment } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";

type Row = Record<string, unknown>;

const CONFIG: ListPageConfig = {
    entityKey: "live_ops",
    resource: "live_ops",
    title: "Live Crew",
    description: "On-site crew assignments, check-in status, and overtime tracking",
    searchPlaceholder: "Search crew...",
    searchKeys: ["role_description", "department"],
    stats: [
        {
            label: "Checked In",
            icon: CheckCircle2,
            compute: (d) => {
                const checkedIn = d.filter((r) => !!r.checked_in_at).length;
                return `${checkedIn}/${d.length}`;
            },
        },
        {
            label: "Overtime Flagged",
            icon: AlertTriangle,
            compute: (d) => d.filter((r) => r.overtime_flagged).length,
        },
        {
            label: "Total Hours Today",
            icon: Clock,
            compute: (d) => d.reduce((s, r) => s + (Number(r.hours_worked) || 0), 0).toFixed(1),
        },
        { label: "Total Crew", icon: Users, compute: (d) => d.length },
    ],
    emptyIcon: Users,
    emptyTitle: "No crew assigned",
    emptyDescription: "Crew assignments will appear here during live events.",
};

export function LiveCrewPageClient() {
    const [search, setSearch] = useState("");
    const { data: crew, isLoading } = useLiveCrewAssignments();
    const updateAssignment = useUpdateLiveCrewAssignment();

    const rows = useMemo(() => (crew ?? []) as Row[], [crew]);

    const filtered = useMemo(() => {
        if (!search) return rows;
        const q = search.toLowerCase();
        return rows.filter(
            (c) =>
                String(c.role_description ?? "")
                    .toLowerCase()
                    .includes(q) ||
                String(c.department ?? "")
                    .toLowerCase()
                    .includes(q)
        );
    }, [rows, search]);

    return (
        <ListPageShell config={CONFIG} data={rows} isLoading={isLoading}>
            {/* Search managed locally because crew cards have mutations that need the typed row */}
            <SearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search crew..."
                className="max-w-sm mb-4"
            />
            <div className="space-y-2">
                {filtered.map((member, i) => (
                    <StaggerItem key={member.id as string} index={i} stagger="tight">
                        <Card
                            className={`hover:shadow-sm transition-all ${member.overtime_flagged ? "border-l-2 border-l-warning" : ""}`}
                        >
                            <CardContent className="py-3">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold">
                                        {(member.radio_callsign as string) ?? "—"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold truncate">
                                                {member.crew_member_id as string}
                                            </h3>
                                            <StatusBadge
                                                status={
                                                    member.checked_in_at
                                                        ? "checked_in"
                                                        : "not_checked_in"
                                                }
                                                className="density-caption shrink-0"
                                            />
                                            {Boolean(member.overtime_flagged) && (
                                                <span className="density-caption text-warning font-medium shrink-0 flex items-center gap-0.5">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    OT
                                                </span>
                                            )}
                                        </div>
                                        <p className="density-caption text-muted-foreground mt-0.5">
                                            {(member.role_description as string) ?? ""} ·{" "}
                                            {(member.department as string) ?? ""} ·{" "}
                                            {(member.zone as string) ?? ""}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right text-sm">
                                            <p className="font-medium">
                                                {Number(member.hours_worked) || 0}h
                                            </p>
                                            {typeof member.checked_in_at === "string" && (
                                                <p className="density-caption text-muted-foreground">
                                                    In:{" "}
                                                    {new Date(
                                                        member.checked_in_at
                                                    ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            {!member.checked_in_at ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 density-caption"
                                                    title="Check in"
                                                    disabled={updateAssignment.isPending}
                                                    onClick={() =>
                                                        updateAssignment.mutate({
                                                            id: member.id as string,
                                                            checked_in_at: new Date().toISOString(),
                                                        })
                                                    }
                                                >
                                                    <LogIn className="h-3 w-3 mr-1" />
                                                    In
                                                </Button>
                                            ) : !member.checked_out_at ? (
                                                <>
                                                    {!member.break_start || member.break_end ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 density-caption"
                                                            title="Start break"
                                                            disabled={updateAssignment.isPending}
                                                            onClick={() =>
                                                                updateAssignment.mutate({
                                                                    id: member.id as string,
                                                                    break_start:
                                                                        new Date().toISOString(),
                                                                    break_end: null,
                                                                })
                                                            }
                                                        >
                                                            <Coffee className="h-3 w-3" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 density-caption text-warning"
                                                            title="End break"
                                                            disabled={updateAssignment.isPending}
                                                            onClick={() =>
                                                                updateAssignment.mutate({
                                                                    id: member.id as string,
                                                                    break_end:
                                                                        new Date().toISOString(),
                                                                })
                                                            }
                                                        >
                                                            <Coffee className="h-3 w-3 mr-1" />
                                                            End
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 density-caption"
                                                        title="Check out"
                                                        disabled={updateAssignment.isPending}
                                                        onClick={() =>
                                                            updateAssignment.mutate({
                                                                id: member.id as string,
                                                                checked_out_at:
                                                                    new Date().toISOString(),
                                                            })
                                                        }
                                                    >
                                                        <LogOut className="h-3 w-3 mr-1" />
                                                        Out
                                                    </Button>
                                                </>
                                            ) : (
                                                <span className="density-caption text-muted-foreground">
                                                    Out:{" "}
                                                    {typeof member.checked_out_at === "string"
                                                        ? new Date(
                                                              member.checked_out_at
                                                          ).toLocaleTimeString([], {
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                          })
                                                        : ""}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </div>
        </ListPageShell>
    );
}
