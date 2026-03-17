"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project, PurchaseOrder, Vendor } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import { CheckCircle2, Clock, FileText, ShoppingCart, Truck } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import type { BadgeVariant } from "@/config/ui-variants";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useProjects, usePurchaseOrders, useVendors } from "@/lib/supabase";
import { usePurchaseRequisitions } from "@/lib/supabase";
import { PROCUREMENT_PAGE } from "@/config/list-page-configs";
import { ListPageShell } from "@/components/shells/list-page-shell";
import type { ListPageConfig } from "@/types/list-page-config";

interface ProcurementRequest {
    id: string;
    projectId: string;
    title: string;
    description: string;
    estimatedCost: number;
    requestedBy: string;
    status: "pending" | "approved" | "rejected" | "ordered";
    priority: "low" | "medium" | "high" | "urgent";
    createdAt: string;
}

const priorityConfig = {
    low: { label: "Low", variant: "ghost" as const },
    medium: { label: "Medium", variant: "info" as const },
    high: { label: "High", variant: "warning" as const },
    urgent: { label: "Urgent", variant: "destructive" as const },
};

const requestStatusConfig = {
    pending: { label: "Pending", variant: "warning" as const },
    approved: { label: "Approved", variant: "success" as const },
    rejected: { label: "Rejected", variant: "destructive" as const },
    ordered: { label: "Ordered", variant: "info" as const },
};

const PROCUREMENT_TAB_VALUES = ["requests", "orders"] as const;

// ─── Content Component ──────────────────────────────────────
function ProcurementContent({
    procurementRequests,
    purchaseOrders,
    projects,
    vendors,
}: {
    procurementRequests: ProcurementRequest[];
    purchaseOrders: PurchaseOrder[];
    projects: Project[];
    vendors: Vendor[];
}) {
    const [activeTab, setActiveTab] = useQueryTabState<"requests" | "orders">({
        key: "tab",
        defaultValue: "requests",
        validValues: PROCUREMENT_TAB_VALUES,
    });
    const [filterProject, setFilterProject] = useState<string>("all");

    const filteredRequests =
        filterProject === "all"
            ? procurementRequests
            : procurementRequests.filter((r) => r.projectId === filterProject);

    const filteredPOs =
        filterProject === "all"
            ? purchaseOrders
            : purchaseOrders.filter((po) => po.projectId === filterProject);

    return (
        <>
            <div className="flex items-center gap-2">
                <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                >
                    <option value="all">All Projects</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <TabBar
                idPrefix="procurement-tabs"
                ariaLabel="Procurement sections"
                items={[
                    { id: "requests", label: "Purchase Requests" },
                    { id: "orders", label: "Purchase Orders" },
                ]}
                value={activeTab}
                onValueChange={(tabId) => setActiveTab(tabId as "requests" | "orders")}
            />

            <TabPanel
                value="requests"
                activeValue={activeTab}
                idPrefix="procurement-tabs"
                className="mt-0 space-y-4"
            >
                {filteredRequests.length === 0 ? (
                    <EmptyState
                        icon={ShoppingCart}
                        title="No purchase requests found"
                        description="No purchase requests yet"
                    />
                ) : (
                    filteredRequests.map((request, i) => {
                        const project = projects.find((p) => p.id === request.projectId);
                        const priority = priorityConfig[request.priority];
                        const status = requestStatusConfig[request.status];

                        return (
                            <StaggerItem key={request.id} index={i} stagger="relaxed">
                                <Card>
                                    <CardContent>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                    <ShoppingCart className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-sm font-bold">
                                                            {request.title}
                                                        </h3>
                                                        <Badge
                                                            variant={priority.variant}
                                                            className="text-[9px]"
                                                        >
                                                            {priority.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        {request.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                                                        <span>{project?.name}</span>
                                                        <span>·</span>
                                                        <span>
                                                            Requested by {request.requestedBy}
                                                        </span>
                                                        <span>·</span>
                                                        <span>{formatDate(request.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold">
                                                    {formatCurrency(request.estimatedCost)}
                                                </p>
                                                <Badge
                                                    variant={status.variant}
                                                    className="text-[10px] mt-1"
                                                >
                                                    {status.label}
                                                </Badge>
                                            </div>
                                        </div>

                                        {request.status === "pending" && (
                                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm">
                                                    Reject
                                                </Button>
                                                <Button size="sm">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Approve
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })
                )}
            </TabPanel>

            <TabPanel
                value="orders"
                activeValue={activeTab}
                idPrefix="procurement-tabs"
                className="mt-0"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border text-left">
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                            PO #
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                            Vendor
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                            Project
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                            Items
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                            Total
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                                            Issued
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPOs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-0">
                                                <EmptyState
                                                    icon={Truck}
                                                    title="No purchase orders found"
                                                    description="No purchase orders yet"
                                                    compact
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPOs.map((po) => {
                                            const vendor = vendors.find(
                                                (v) => v.id === po.vendorId
                                            );
                                            const project = projects.find(
                                                (p) => p.id === po.projectId
                                            );
                                            return (
                                                <tr
                                                    key={po.id}
                                                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-mono font-medium">
                                                            PO-{po.id.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {vendor?.name || po.vendorName}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {project?.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs">
                                                        {po.items.length} items
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold">
                                                        {formatCurrency(po.totalAmount)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={
                                                                getStatusVariant(
                                                                    po.status
                                                                ) as BadgeVariant
                                                            }
                                                            className="text-[10px]"
                                                        >
                                                            {getStatusLabel(po.status)}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {formatDate(po.issuedDate)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </TabPanel>
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function ProcurementPage() {
    const { data: sbPOs, isLoading: loadingPOs } = usePurchaseOrders();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();
    const { data: sbVendors } = useVendors();
    const { data: sbRequisitions, isLoading: loadingReqs } = usePurchaseRequisitions();

    const purchaseOrders: PurchaseOrder[] = useMemo(
        () => (sbPOs ?? []) as unknown as PurchaseOrder[],
        [sbPOs]
    );
    const projects: Project[] = useMemo(
        () => (sbProjects ?? []) as unknown as Project[],
        [sbProjects]
    );
    const vendors: Vendor[] = useMemo(() => (sbVendors ?? []) as unknown as Vendor[], [sbVendors]);
    const procurementRequests: ProcurementRequest[] = useMemo(
        () =>
            (sbRequisitions ?? []).map((r: Record<string, unknown>) => ({
                id: String(r.id ?? ""),
                projectId: String(r.project_id ?? ""),
                title: String(r.title ?? ""),
                description: String(r.description ?? ""),
                estimatedCost: Number(r.estimated_cost ?? 0),
                requestedBy: String(r.requested_by ?? ""),
                status: String(r.status ?? "pending") as ProcurementRequest["status"],
                priority: String(r.priority ?? "medium") as ProcurementRequest["priority"],
                createdAt: String(r.created_at ?? ""),
            })),
        [sbRequisitions]
    );

    const isLoading = loadingPOs || loadingProjects || loadingReqs;

    const config: ListPageConfig = useMemo(
        () => ({
            ...PROCUREMENT_PAGE,
            title: "Procurement Hub",
            createLabel: "New Request",
            stats: [
                {
                    label: "Total PO Value",
                    icon: ShoppingCart,
                    compute: () =>
                        formatCurrency(purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0)),
                },
                {
                    label: "Pending Requests",
                    icon: Clock,
                    compute: () => procurementRequests.filter((r) => r.status === "pending").length,
                },
                {
                    label: "Active POs",
                    icon: FileText,
                    compute: () => purchaseOrders.filter((po) => po.status === "issued").length,
                },
                {
                    label: "Vendors Used",
                    icon: Truck,
                    compute: () => vendors.filter((v) => v.status === "active").length,
                },
            ],
            contentSlot: (
                <ProcurementContent
                    procurementRequests={procurementRequests}
                    purchaseOrders={purchaseOrders}
                    projects={projects}
                    vendors={vendors}
                />
            ),
        }),
        [procurementRequests, purchaseOrders, projects, vendors]
    );

    return (
        <ListPageShell
            config={config}
            data={procurementRequests as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
