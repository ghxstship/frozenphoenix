"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, CheckCircle2, Package, Wrench } from "lucide-react";
import { useEquipmentCheckIns } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Equipment Check-Ins",
    description: "On-site equipment status, deployment tracking, and condition monitoring",
    searchable: true,
    searchPlaceholder: "Search equipment...",
    searchKeys: ["asset_id", "department"],
    stats: [
        {
            label: "Total Items",
            icon: Package,
            compute: (d) => d.reduce((s, r) => s + (Number(r.received_quantity) || 0), 0),
        },
        {
            label: "Deployed",
            icon: CheckCircle2,
            compute: (d) => d.filter((r) => r.status === "deployed").length,
        },
        {
            label: "Issues",
            icon: AlertTriangle,
            compute: (d) =>
                d.filter((r) =>
                    ["issue_reported", "failed", "being_repaired"].includes(r.status as string)
                ).length,
        },
        {
            label: "Departments",
            icon: Wrench,
            compute: (d) => new Set(d.map((r) => r.department).filter(Boolean)).size,
        },
    ],
    cardRenderer: (item: Row) => (
        <Card
            className={`hover:shadow-sm transition-all ${["issue_reported", "failed"].includes(item.status as string) ? "border-l-2 border-l-warning" : ""}`}
        >
            <CardContent className="py-3">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold truncate">
                                {item.asset_id as string}
                            </h3>
                            <StatusBadge
                                status={item.status as string}
                                className="text-[10px] shrink-0"
                            />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                            {typeof item.department === "string" && item.department && (
                                <span>{item.department}</span>
                            )}
                            {typeof item.deployed_location === "string" &&
                                item.deployed_location && <span>{item.deployed_location}</span>}
                            {typeof item.condition_on_arrival === "string" &&
                                item.condition_on_arrival && (
                                    <span>Condition: {item.condition_on_arrival}</span>
                                )}
                        </div>
                    </div>
                    <div className="text-right text-sm shrink-0">
                        <p className="font-medium">
                            {Number(item.received_quantity) || 0}/
                            {Number(item.expected_quantity) || 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">received</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    ),
    emptyState: {
        icon: Package,
        title: "No equipment",
        description: "Equipment check-in records will appear here during live events.",
    },
};

export default function EquipmentPage() {
    const { data, isLoading } = useEquipmentCheckIns();

    return (
        <OperationalDashboardShell
            config={CONFIG}
            data={data as Row[] | null}
            isLoading={isLoading}
        />
    );
}
