"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Chip } from "@/components/ui/chip";
import { CheckCircle2, Crown, Users } from "lucide-react";
import { useVipGuests } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const TIER_COLORS: Record<string, string> = {
    platinum: "border-l-info",
    gold: "border-l-warning",
    silver: "border-l-secondary",
    bronze: "",
};

const CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "VIP Management",
    description: "Guest arrivals, escort assignments, zone access, and service requests",
    searchable: true,
    searchPlaceholder: "Search VIPs...",
    searchKeys: ["name", "affiliation"],
    stats: [
        { label: "Total VIPs", icon: Crown, compute: (d) => d.length },
        {
            label: "In Venue",
            icon: CheckCircle2,
            compute: (d) =>
                d.filter((r) => r.status === "in_venue" || r.status === "arrived").length,
        },
        {
            label: "Expected",
            icon: Users,
            compute: (d) => d.filter((r) => r.status === "expected").length,
        },
        {
            label: "Platinum",
            icon: Crown,
            compute: (d) => d.filter((r) => r.tier === "platinum").length,
        },
    ],
    cardRenderer: (vip: Row) => {
        const name = (vip.name as string) ?? "";
        const actualArrival = vip.actual_arrival as string | undefined;
        const expectedArrival = vip.expected_arrival as string | undefined;
        const arrivalDisplay = actualArrival
            ? new Date(actualArrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : expectedArrival
              ? new Date(expectedArrival).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })
              : "—";
        const zones = Array.isArray(vip.zone_access) ? (vip.zone_access as string[]) : [];
        return (
            <Card
                className={`hover:shadow-sm transition-all border-l-2 ${TIER_COLORS[vip.tier as string] ?? ""}`}
            >
                <CardContent className="py-3">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold">
                            {name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold truncate">{name}</h3>
                                <StatusBadge
                                    status={vip.tier as string}
                                    className="text-[10px] shrink-0"
                                />
                                <StatusBadge
                                    status={vip.status as string}
                                    className="text-[10px] shrink-0"
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {(vip.affiliation as string) ?? ""}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {zones.map((z) => (
                                    <Chip key={z} size="sm">
                                        {z}
                                    </Chip>
                                ))}
                            </div>
                        </div>
                        <div className="text-right text-sm shrink-0">
                            <p className="font-medium">{arrivalDisplay}</p>
                            <p className="text-[10px] text-muted-foreground">
                                {actualArrival ? "arrived" : "expected"}
                            </p>
                            {typeof vip.escort_id === "string" && vip.escort_id && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Escort: {vip.escort_id}
                                </p>
                            )}
                        </div>
                    </div>
                    {typeof vip.special_requests === "string" && vip.special_requests && (
                        <p className="text-[10px] text-muted-foreground mt-1 ml-14">
                            Note: {vip.special_requests}
                        </p>
                    )}
                </CardContent>
            </Card>
        );
    },
    emptyState: {
        icon: Crown,
        title: "No VIP guests",
        description: "VIP guest records will appear here during live events.",
    },
};

export default function VipPage() {
    const { data, isLoading } = useVipGuests();

    return (
        <OperationalDashboardShell
            config={CONFIG}
            data={data as Row[] | null}
            isLoading={isLoading}
        />
    );
}
