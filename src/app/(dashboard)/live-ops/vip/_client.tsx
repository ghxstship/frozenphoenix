"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Chip } from "@/components/ui/chip";
import { CheckCircle2, Crown, Users } from "lucide-react";
import { useVipGuests } from "@/lib/supabase";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";
import { TIER_BORDER_CLASSES } from "@/config/ui-variants";

type Row = Record<string, unknown>;

const CONFIG: ListPageConfig = {
    entityKey: "live_ops",
    resource: "live_ops",
    title: "VIP Management",
    description: "Guest arrivals, escort assignments, zone access, and service requests",
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
                className={`hover:shadow-sm transition-all border-l-2 ${TIER_BORDER_CLASSES[vip.tier as string] ?? ""}`}
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
                                    className="density-caption shrink-0"
                                />
                                <StatusBadge
                                    status={vip.status as string}
                                    className="density-caption shrink-0"
                                />
                            </div>
                            <p className="density-caption text-muted-foreground mt-0.5">
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
                            <p className="density-caption text-muted-foreground">
                                {actualArrival ? "arrived" : "expected"}
                            </p>
                            {typeof vip.escort_id === "string" && vip.escort_id && (
                                <p className="density-caption text-muted-foreground mt-0.5">
                                    Escort: {vip.escort_id}
                                </p>
                            )}
                        </div>
                    </div>
                    {typeof vip.special_requests === "string" && vip.special_requests && (
                        <p className="density-caption text-muted-foreground mt-1 ml-14">
                            Note: {vip.special_requests}
                        </p>
                    )}
                </CardContent>
            </Card>
        );
    },
    emptyIcon: Crown,
    emptyTitle: "No VIP guests",
    emptyDescription: "VIP guest records will appear here during live events.",
};

export function VipPageClient() {
    const { data, isLoading } = useVipGuests();

    return <ListPageShell config={CONFIG} data={data as Row[] | undefined} isLoading={isLoading} />;
}
