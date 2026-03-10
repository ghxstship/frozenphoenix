"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { LoadingState } from "@/components/layouts/loading-state";
import { AlertTriangle, CheckCircle2, Package, Wrench } from "lucide-react";
import { useEquipmentCheckIns } from "@/lib/supabase/hooks-live-ops";

export default function EquipmentPage() {
    const [search, setSearch] = useState("");
    const { data: equipment, isLoading } = useEquipmentCheckIns();

    if (isLoading) return <LoadingState />;

    const rows = equipment ?? [];
    const deployed = rows.filter((e) => e.status === "deployed").length;
    const issues = rows.filter((e) =>
        ["issue_reported", "failed", "being_repaired"].includes(e.status)
    ).length;
    const totalItems = rows.reduce((s, e) => s + (e.received_quantity ?? 0), 0);

    const filtered = rows.filter(
        (e) =>
            !search ||
            e.asset_id.toLowerCase().includes(search.toLowerCase()) ||
            (e.department ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Equipment Check-Ins"
                description="On-site equipment status, deployment tracking, and condition monitoring"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Items" value={totalItems} icon={Package} />
                <StatCard title="Deployed" value={deployed} icon={CheckCircle2} />
                <StatCard title="Issues" value={issues} icon={AlertTriangle} />
                <StatCard
                    title="Departments"
                    value={new Set(rows.map((e) => e.department).filter(Boolean)).size}
                    icon={Wrench}
                />
            </div>

            <SearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search equipment..."
                className="max-w-sm"
            />

            <div className="space-y-2">
                {filtered.map((item, i) => (
                    <StaggerItem key={item.id} index={i} stagger="tight">
                        <Card
                            className={`hover:shadow-sm transition-all ${["issue_reported", "failed"].includes(item.status) ? "border-l-2 border-l-warning" : ""}`}
                        >
                            <CardContent className="py-3">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold truncate">
                                                {item.asset_id}
                                            </h3>
                                            <StatusBadge
                                                status={item.status}
                                                className="text-[10px] shrink-0"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                            {item.department && <span>{item.department}</span>}
                                            {item.deployed_location && <span>{item.deployed_location}</span>}
                                            {item.condition_on_arrival && <span>Condition: {item.condition_on_arrival}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right text-sm shrink-0">
                                        <p className="font-medium">
                                            {item.received_quantity ?? 0}/{item.expected_quantity ?? 0}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            received
                                        </p>
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
