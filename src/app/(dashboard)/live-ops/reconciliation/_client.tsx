"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, CheckCircle2, ClipboardCheck } from "lucide-react";
import { useEquipmentCheckIns } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Asset Reconciliation",
    description: "Post-event asset condition tracking, damage logging, and discrepancy resolution",
    searchable: true,
    searchPlaceholder: "Search assets...",
    searchKeys: ["asset_id", "department"],
    stats: [
        {
            label: "Reconciled",
            icon: CheckCircle2,
            compute: (d) => `${d.filter((r) => r.status === "loaded_out").length}/${d.length}`,
        },
        {
            label: "Discrepancies",
            icon: AlertTriangle,
            compute: (d) =>
                d.filter((r) => ["issue_reported", "failed"].includes(r.status as string)).length,
        },
        {
            label: "Missing Items",
            icon: ClipboardCheck,
            compute: (d) =>
                d.reduce(
                    (s, r) =>
                        s +
                        Math.max(
                            0,
                            (Number(r.expected_quantity) || 0) - (Number(r.returned_quantity) || 0)
                        ),
                    0
                ),
        },
        { label: "Total Equipment", icon: AlertTriangle, compute: (d) => d.length },
    ],
    cardRenderer: (item: Row) => {
        const expected = Number(item.expected_quantity) || 0;
        const returned = Number(item.returned_quantity) || 0;
        const missing = Math.max(0, expected - returned);
        const hasIssue = ["issue_reported", "failed"].includes(item.status as string);
        const isReturned = item.status === "loaded_out";
        return (
            <Card
                className={`hover:shadow-sm transition-all ${hasIssue ? "border-l-2 border-l-destructive" : isReturned ? "border-l-2 border-l-success" : ""}`}
            >
                <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold truncate">
                                    {item.asset_id as string}
                                </h3>
                                <StatusBadge
                                    status={item.status as string}
                                    className="density-caption shrink-0"
                                />
                            </div>
                            <div className="flex items-center gap-3 density-caption text-muted-foreground mt-0.5">
                                {typeof item.department === "string" && item.department && (
                                    <span>{item.department}</span>
                                )}
                                <span>Expected: {expected}</span>
                                <span>Returned: {returned}</span>
                                {missing > 0 && (
                                    <span className="text-destructive">Missing: {missing}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 density-caption text-muted-foreground mt-0.5">
                                {typeof item.condition_on_arrival === "string" &&
                                    item.condition_on_arrival && (
                                        <span>
                                            Arrival:{" "}
                                            <StatusBadge
                                                status={item.condition_on_arrival}
                                                className="density-caption"
                                            />
                                        </span>
                                    )}
                            </div>
                            {typeof item.condition_notes === "string" && item.condition_notes && (
                                <p className="density-caption text-muted-foreground mt-1">
                                    {item.condition_notes}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    },
    emptyState: {
        icon: ClipboardCheck,
        title: "No equipment records",
        description: "Asset reconciliation data will appear here after load-out.",
    },
};

export function ReconciliationPageClient() {
    const { data, isLoading } = useEquipmentCheckIns();

    return (
        <OperationalDashboardShell
            config={CONFIG}
            data={data as Row[] | null}
            isLoading={isLoading}
        />
    );
}
