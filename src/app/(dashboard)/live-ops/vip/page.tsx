"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Chip } from "@/components/ui/chip";
import { LoadingState } from "@/components/layouts/loading-state";
import { CheckCircle2, Crown, Users } from "lucide-react";
import { useVipGuests } from "@/lib/supabase/hooks-live-ops";

const TIER_COLORS: Record<string, string> = {
    platinum: "border-l-info",
    gold: "border-l-warning",
    silver: "border-l-secondary",
    bronze: "",
};

export default function VipPage() {
    const [search, setSearch] = useState("");
    const { data: vips, isLoading } = useVipGuests();

    if (isLoading) return <LoadingState />;

    const rows = vips ?? [];
    const inVenue = rows.filter(
        (v) => v.status === "in_venue" || v.status === "arrived"
    ).length;
    const expected = rows.filter((v) => v.status === "expected").length;
    const platinum = rows.filter((v) => v.tier === "platinum").length;

    const filtered = rows.filter(
        (v) =>
            !search ||
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            (v.affiliation ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="VIP Management"
                description="Guest arrivals, escort assignments, zone access, and service requests"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total VIPs" value={rows.length} icon={Crown} />
                <StatCard title="In Venue" value={inVenue} icon={CheckCircle2} />
                <StatCard title="Expected" value={expected} icon={Users} />
                <StatCard title="Platinum" value={platinum} icon={Crown} />
            </div>

            <SearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search VIPs..."
                className="max-w-sm"
            />

            <div className="space-y-2">
                {filtered.map((vip, i) => {
                    const arrivalDisplay = vip.actual_arrival
                        ? new Date(vip.actual_arrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : vip.expected_arrival
                            ? new Date(vip.expected_arrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "—";
                    return (
                        <StaggerItem key={vip.id} index={i} stagger="tight">
                            <Card
                                className={`hover:shadow-sm transition-all border-l-2 ${TIER_COLORS[vip.tier] ?? ""}`}
                            >
                                <CardContent className="py-3">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold">
                                            {vip.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold truncate">
                                                    {vip.name}
                                                </h3>
                                                <StatusBadge
                                                    status={vip.tier}
                                                    className="text-[10px] shrink-0"
                                                />
                                                <StatusBadge
                                                    status={vip.status}
                                                    className="text-[10px] shrink-0"
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {vip.affiliation ?? ""}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(vip.zone_access ?? []).map((z) => (
                                                    <Chip key={z} size="sm">
                                                        {z}
                                                    </Chip>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right text-sm shrink-0">
                                            <p className="font-medium">
                                                {arrivalDisplay}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {vip.actual_arrival ? "arrived" : "expected"}
                                            </p>
                                            {vip.escort_id && (
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    Escort: {vip.escort_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {vip.special_requests && (
                                        <p className="text-[10px] text-muted-foreground mt-1 ml-14">
                                            Note: {vip.special_requests}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    );
                })}
            </div>
        </div>
    );
}
