"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_WORK_ORDER_CONFIG } from "@/config/create-entity-configs";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    Gavel,
    LayoutGrid,
    Loader2,
    Play,
    Plus,
    Table2,
    Users,
} from "lucide-react";
import { MOCK_WORK_ORDERS } from "@/lib/demo-data-vendor-lifecycle";
import { useWorkOrders } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { WorkOrderPriority, WorkOrderStatus } from "@/types/vendor-lifecycle";
import { SegmentedControl } from "@/components/ui/segmented-control";

type ViewMode = "cards" | "table";

const WORK_ORDER_STATUSES: WorkOrderStatus[] = [
    "draft",
    "posted",
    "bidding",
    "assigned",
    "accepted",
    "scheduled",
    "in_progress",
    "on_hold",
    "completed",
    "verified",
    "invoiced",
    "cancelled",
    "disputed",
];

const PRIORITY_CONFIG: Record<WorkOrderPriority, { label: string; color: string }> = {
    low: { label: "Low", color: "text-muted-foreground" },
    normal: { label: "Normal", color: "text-foreground" },
    high: { label: "High", color: "text-warning" },
    urgent: { label: "Urgent", color: "text-destructive" },
    emergency: { label: "Emergency", color: "text-destructive font-bold" },
};

export default function WorkOrdersPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const VIEW_MODES = ["cards", "table"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "cards",
        validValues: VIEW_MODES,
    });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: sbWOs, isLoading } = useWorkOrders();

    const workOrders = (sbWOs ?? []) as typeof MOCK_WORK_ORDERS;
    const filtered = workOrders.filter((wo) => {
        const matchesSearch =
            !search ||
            wo.title.toLowerCase().includes(search.toLowerCase()) ||
            wo.number.toLowerCase().includes(search.toLowerCase()) ||
            (wo.vendorName || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const activeWOs = workOrders.filter((wo) =>
        ["in_progress", "scheduled", "accepted", "assigned"].includes(wo.status)
    );
    const openBids = workOrders.filter((wo) => wo.isOpenForBids);
    const completedWOs = workOrders.filter((wo) =>
        ["completed", "verified", "invoiced"].includes(wo.status)
    );
    const totalEstimated = workOrders.reduce((sum, wo) => sum + (wo.estimatedCost || 0), 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="work_orders" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Work Orders"
                    description="Dispatch, assign, and track all vendor and crew work orders across projects"
                >
                    <div className="flex items-center gap-2">
                        <SegmentedControl<ViewMode>
                            ariaLabel="Work order view mode"
                            value={viewMode}
                            onValueChange={setViewMode}
                            options={[
                                {
                                    value: "cards",
                                    label: "Cards",
                                    icon: <LayoutGrid className="h-4 w-4" />,
                                    labelHidden: true,
                                },
                                {
                                    value: "table",
                                    label: "Table",
                                    icon: <Table2 className="h-4 w-4" />,
                                    labelHidden: true,
                                },
                            ]}
                        />
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="h-4 w-4" /> New Work Order
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Active Work Orders" value={activeWOs.length} icon={Play} />
                    <StatCard title="Open for Bids" value={openBids.length} icon={Gavel} />
                    <StatCard title="Completed" value={completedWOs.length} icon={CheckCircle2} />
                    <StatCard
                        title="Total Estimated"
                        value={formatCurrency(totalEstimated)}
                        icon={ClipboardList}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search work orders..."
                        className="flex-1 max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        {WORK_ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {getStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                </div>

                {viewMode === "cards" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((wo, i) => (
                            <StaggerItem key={wo.id} index={i} stagger="relaxed">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-mono text-muted-foreground">
                                                        {wo.number}
                                                    </span>
                                                    <span
                                                        className={`text-[10px] font-medium ${PRIORITY_CONFIG[wo.priority].color}`}
                                                    >
                                                        {PRIORITY_CONFIG[wo.priority].label}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-bold truncate">
                                                    {wo.title}
                                                </h3>
                                            </div>
                                            <StatusBadge
                                                status={wo.status}
                                                className="text-[10px] ml-2 shrink-0"
                                            />
                                        </div>

                                        {wo.projectName && (
                                            <p className="text-xs text-muted-foreground mb-2 truncate">
                                                {wo.projectName}
                                            </p>
                                        )}

                                        {wo.description && (
                                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                                {wo.description}
                                            </p>
                                        )}

                                        <div className="space-y-1.5 text-xs mb-3">
                                            {wo.vendorName && (
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Users className="h-3 w-3" />
                                                    <span>{wo.vendorName}</span>
                                                </div>
                                            )}
                                            {wo.scheduledStart && (
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {new Date(
                                                            wo.scheduledStart
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    {wo.scheduledEnd && (
                                                        <span>
                                                            —{" "}
                                                            {new Date(
                                                                wo.scheduledEnd
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-border">
                                            <div className="flex items-center gap-3 text-xs">
                                                {wo.estimatedCost && (
                                                    <span className="font-medium">
                                                        {formatCurrency(wo.estimatedCost)}
                                                    </span>
                                                )}
                                                {wo.estimatedHours && (
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {wo.estimatedHours}h
                                                    </span>
                                                )}
                                            </div>
                                            {wo.isOpenForBids && (
                                                <Badge variant="info" className="text-[10px]">
                                                    <Gavel className="h-3 w-3 mr-1" /> Open for Bids
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                )}

                {viewMode === "table" && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="text-left p-3 font-medium">Number</th>
                                            <th className="text-left p-3 font-medium">Title</th>
                                            <th className="text-left p-3 font-medium">Project</th>
                                            <th className="text-left p-3 font-medium">Vendor</th>
                                            <th className="text-left p-3 font-medium">Status</th>
                                            <th className="text-left p-3 font-medium">Priority</th>
                                            <th className="text-right p-3 font-medium">
                                                Est. Cost
                                            </th>
                                            <th className="text-left p-3 font-medium">Scheduled</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((wo) => (
                                            <tr
                                                key={wo.id}
                                                className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                                            >
                                                <td className="p-3 font-mono text-xs">
                                                    {wo.number}
                                                </td>
                                                <td className="p-3 font-medium">{wo.title}</td>
                                                <td className="p-3 text-muted-foreground">
                                                    {wo.projectName || "—"}
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {wo.vendorName || "—"}
                                                </td>
                                                <td className="p-3">
                                                    <StatusBadge
                                                        status={wo.status}
                                                        className="text-[10px]"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className={`text-xs ${PRIORITY_CONFIG[wo.priority].color}`}
                                                    >
                                                        {PRIORITY_CONFIG[wo.priority].label}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    {wo.estimatedCost
                                                        ? formatCurrency(wo.estimatedCost)
                                                        : "—"}
                                                </td>
                                                <td className="p-3 text-muted-foreground text-xs">
                                                    {wo.scheduledStart
                                                        ? new Date(
                                                              wo.scheduledStart
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            <CreateEntityDialog
                config={CREATE_WORK_ORDER_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
