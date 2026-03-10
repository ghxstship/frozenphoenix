"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { LoadingState } from "@/components/layouts/loading-state";
import { AlertTriangle, CheckCircle2, ClipboardCheck } from "lucide-react";
import { useEquipmentCheckIns } from "@/lib/supabase/hooks-live-ops";

export default function ReconciliationPage() {
    const [search, setSearch] = useState("");
    const { data: equipment, isLoading } = useEquipmentCheckIns();

    if (isLoading) return <LoadingState />;

    const rows = equipment ?? [];
    const reconciled = rows.filter((i) => i.status === "loaded_out").length;
    const discrepancies = rows.filter((i) =>
        ["issue_reported", "failed"].includes(i.status)
    ).length;
    const totalMissing = rows.reduce(
        (s, i) => s + Math.max(0, (i.expected_quantity ?? 0) - (i.returned_quantity ?? 0)),
        0
    );

    const filtered = rows.filter(
        (i) =>
            !search ||
            i.asset_id.toLowerCase().includes(search.toLowerCase()) ||
            (i.department ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Asset Reconciliation"
                description="Post-event asset condition tracking, damage logging, and discrepancy resolution"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Reconciled"
                    value={`${reconciled}/${rows.length}`}
                    icon={CheckCircle2}
                />
                <StatCard title="Discrepancies" value={discrepancies} icon={AlertTriangle} />
                <StatCard title="Missing Items" value={totalMissing} icon={ClipboardCheck} />
                <StatCard
                    title="Total Equipment"
                    value={rows.length}
                    icon={AlertTriangle}
                />
            </div>

            <SearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search assets..."
                className="max-w-sm"
            />

            <div className="space-y-2">
                {filtered.map((item, i) => {
                    const expected = item.expected_quantity ?? 0;
                    const returned = item.returned_quantity ?? 0;
                    const missing = Math.max(0, expected - returned);
                    const hasIssue = ["issue_reported", "failed"].includes(item.status);
                    const isReturned = item.status === "loaded_out";
                    return (
                        <StaggerItem key={item.id} index={i} stagger="tight">
                            <Card
                                className={`hover:shadow-sm transition-all ${hasIssue ? "border-l-2 border-l-destructive" : isReturned ? "border-l-2 border-l-success" : ""}`}
                            >
                                <CardContent className="py-3">
                                    <div className="flex items-start gap-3">
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
                                                <span>Expected: {expected}</span>
                                                <span>Returned: {returned}</span>
                                                {missing > 0 && (
                                                    <span className="text-destructive">
                                                        Missing: {missing}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                                                {item.condition_on_arrival && (
                                                    <span>
                                                        Arrival:{" "}
                                                        <StatusBadge
                                                            status={item.condition_on_arrival}
                                                            className="text-[9px]"
                                                        />
                                                    </span>
                                                )}
                                            </div>
                                            {item.condition_notes && (
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {item.condition_notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    );
                })}
            </div>
        </div>
    );
}
