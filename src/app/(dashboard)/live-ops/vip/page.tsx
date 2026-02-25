"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Chip } from "@/components/ui/chip";
import { Crown, Users, CheckCircle2 } from "lucide-react";

interface MockVip {
    id: string;
    name: string;
    affiliation: string;
    tier: string;
    status: string;
    expectedArrival: string;
    actualArrival?: string;
    escortName?: string;
    zoneAccess: string[];
    specialRequests?: string;
}

const mockVips: MockVip[] = [
    { id: "1", name: "Sarah Mitchell", affiliation: "Title Sponsor — Acme Corp", tier: "platinum", status: "in_venue", expectedArrival: "17:00", actualArrival: "16:45", escortName: "Casey Kim", zoneAccess: ["VIP Lounge", "Backstage", "Main Stage"], specialRequests: "Vegetarian meal" },
    { id: "2", name: "David Park", affiliation: "CEO — BrandCo", tier: "gold", status: "arrived", expectedArrival: "17:30", actualArrival: "17:25", escortName: "Jordan Lee", zoneAccess: ["VIP Lounge", "Main Stage"] },
    { id: "3", name: "Lisa Chen", affiliation: "VP Marketing — TechStart", tier: "gold", status: "in_venue", expectedArrival: "16:30", actualArrival: "16:20", zoneAccess: ["VIP Lounge", "Main Stage"], specialRequests: "Wheelchair access" },
    { id: "4", name: "Marcus Reed", affiliation: "Investor", tier: "silver", status: "expected", expectedArrival: "18:00", zoneAccess: ["VIP Lounge"] },
    { id: "5", name: "Emma Torres", affiliation: "Press — Vogue", tier: "silver", status: "expected", expectedArrival: "18:30", zoneAccess: ["VIP Lounge", "Press Box"] },
    { id: "6", name: "James Wright", affiliation: "Artist Management", tier: "platinum", status: "departed", expectedArrival: "15:00", actualArrival: "14:50", escortName: "Pat Davis", zoneAccess: ["VIP Lounge", "Backstage", "Green Room"] },
];

const TIER_COLORS: Record<string, string> = {
    platinum: "border-l-info",
    gold: "border-l-warning",
    silver: "border-l-secondary",
    bronze: "",
};

export default function VipPage() {
    const [search, setSearch] = useState("");

    const inVenue = mockVips.filter(v => v.status === "in_venue" || v.status === "arrived").length;
    const expected = mockVips.filter(v => v.status === "expected").length;
    const platinum = mockVips.filter(v => v.tier === "platinum").length;

    const filtered = mockVips.filter(v =>
        !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.affiliation.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="VIP Management" description="Guest arrivals, escort assignments, zone access, and service requests" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total VIPs" value={mockVips.length} icon={Crown} />
                <StatCard title="In Venue" value={inVenue} icon={CheckCircle2} />
                <StatCard title="Expected" value={expected} icon={Users} />
                <StatCard title="Platinum" value={platinum} icon={Crown} />
            </div>

            <SearchInput value={search} onValueChange={setSearch} placeholder="Search VIPs..." className="max-w-sm" />

            <div className="space-y-2">
                {filtered.map((vip, i) => (
                    <StaggerItem key={vip.id} index={i} stagger="tight">
                    <Card className={`hover:shadow-sm transition-all border-l-2 ${TIER_COLORS[vip.tier] ?? ""}`}>
                        <CardContent className="py-3">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold">
                                    {vip.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold truncate">{vip.name}</h3>
                                        <StatusBadge status={vip.tier} className="text-[10px] shrink-0" />
                                        <StatusBadge status={vip.status} className="text-[10px] shrink-0" />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{vip.affiliation}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {vip.zoneAccess.map(z => (
                                            <Chip key={z} size="sm">{z}</Chip>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right text-sm shrink-0">
                                    <p className="font-medium">{vip.actualArrival ?? vip.expectedArrival}</p>
                                    <p className="text-[10px] text-muted-foreground">{vip.actualArrival ? "arrived" : "expected"}</p>
                                    {vip.escortName && <p className="text-[10px] text-muted-foreground mt-0.5">Escort: {vip.escortName}</p>}
                                </div>
                            </div>
                            {vip.specialRequests && (
                                <p className="text-[10px] text-muted-foreground mt-1 ml-14">Note: {vip.specialRequests}</p>
                            )}
                        </CardContent>
                    </Card>
                    </StaggerItem>
                ))}
            </div>
        </div>
    );
}
