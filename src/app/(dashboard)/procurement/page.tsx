"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { MOCK_POS, MOCK_PROJECTS, MOCK_VENDORS } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import { CheckCircle2, Clock, FileText, Plus, ShoppingCart, Truck } from "lucide-react";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import type { BadgeVariant } from "@/config/ui-variants";
import { PermissionGate } from "@/components/permission-guard";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";

// TODO: Wire to Supabase when procurement_requests table is available

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

const MOCK_REQUESTS: ProcurementRequest[] = [
    {
        id: "pr1",
        projectId: "p1",
        title: "LED Panel Controllers",
        description: "DMX controllers for video wall",
        estimatedCost: 4500,
        requestedBy: "Marcus Johnson",
        status: "pending",
        priority: "high",
        createdAt: "2026-02-22",
    },
    {
        id: "pr2",
        projectId: "p1",
        title: "Steel Brackets (Custom)",
        description: "Custom fabricated mounting brackets",
        estimatedCost: 2800,
        requestedBy: "Alex Rivera",
        status: "approved",
        priority: "urgent",
        createdAt: "2026-02-20",
    },
    {
        id: "pr3",
        projectId: "p2",
        title: "Vinyl Wrap Material",
        description: "3M vinyl for window graphics",
        estimatedCost: 1200,
        requestedBy: "Jordan Park",
        status: "ordered",
        priority: "medium",
        createdAt: "2026-02-18",
    },
    {
        id: "pr4",
        projectId: "p1",
        title: "Rigging Hardware",
        description: "Shackles and carabiners",
        estimatedCost: 850,
        requestedBy: "Aisha Patel",
        status: "pending",
        priority: "low",
        createdAt: "2026-02-23",
    },
];

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

export default function ProcurementPage() {
    const [activeTab, setActiveTab] = useQueryTabState<"requests" | "orders">({
        key: "tab",
        defaultValue: "requests",
        validValues: PROCUREMENT_TAB_VALUES,
    });
    const [filterProject, setFilterProject] = useState<string>("all");

    const totalPOValue = MOCK_POS.reduce((sum, po) => sum + po.totalAmount, 0);
    const pendingRequests = MOCK_REQUESTS.filter((r) => r.status === "pending").length;
    const issuedPOs = MOCK_POS.filter((po) => po.status === "issued").length;

    const filteredRequests =
        filterProject === "all"
            ? MOCK_REQUESTS
            : MOCK_REQUESTS.filter((r) => r.projectId === filterProject);

    const filteredPOs =
        filterProject === "all"
            ? MOCK_POS
            : MOCK_POS.filter((po) => po.projectId === filterProject);

    return (
        <PermissionGate resource="procurement" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Procurement Hub"
                    description="Purchase requests, vendor orders, and spend tracking"
                >
                    <div className="flex items-center gap-2">
                        <select
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                        >
                            <option value="all">All Projects</option>
                            {MOCK_PROJECTS.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            New Request
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total PO Value"
                        value={formatCurrency(totalPOValue)}
                        icon={ShoppingCart}
                    />
                    <StatCard title="Pending Requests" value={pendingRequests} icon={Clock} />
                    <StatCard title="Active POs" value={issuedPOs} icon={FileText} />
                    <StatCard
                        title="Vendors Used"
                        value={MOCK_VENDORS.filter((v) => v.status === "active").length}
                        icon={Truck}
                    />
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
                    {filteredRequests.map((request, i) => {
                        const project = MOCK_PROJECTS.find((p) => p.id === request.projectId);
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
                    })}
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
                                        {filteredPOs.map((po) => {
                                            const vendor = MOCK_VENDORS.find(
                                                (v) => v.id === po.vendorId
                                            );
                                            const project = MOCK_PROJECTS.find(
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
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabPanel>
            </div>
        </PermissionGate>
    );
}
