"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_PURCHASE_ORDER_CONFIG } from "@/config/create-entity-configs";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    Loader2,
    Package,
    Plus,
    Truck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { usePurchaseOrders } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

const PO_STATUSES = ["draft", "issued", "received", "matched", "disputed"] as const;

const STATUS_ICONS: Record<string, React.ReactNode> = {
    draft: <FileText className="h-4 w-4" />,
    issued: <Truck className="h-4 w-4" />,
    received: <Package className="h-4 w-4" />,
    matched: <CheckCircle2 className="h-4 w-4" />,
    disputed: <Clock className="h-4 w-4" />,
};

export default function PurchaseOrdersPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbOrders, isLoading } = usePurchaseOrders();

    interface PORow {
        id: string;
        vendor_id: string;
        total_amount: number;
        status: string;
        issued_date: string;
        created_at: string;
    }

    const orders: PORow[] = (sbOrders ?? []).map((o: Record<string, unknown>) => ({
        id: (o.id as string) ?? "",
        vendor_id: (o.vendor_id as string) ?? "",
        total_amount: Number(o.total_amount ?? 0),
        status: (o.status as string) ?? "draft",
        issued_date: (o.issued_date as string) ?? "",
        created_at: (o.created_at as string) ?? "",
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = orders.filter((o) => {
        const matchesSearch = !search || o.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalValue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const issuedCount = orders.filter((o) => o.status === "issued").length;
    const disputedCount = orders.filter((o) => o.status === "disputed").length;

    return (
        <PermissionGate resource="purchase_orders" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Purchase Orders"
                    description="Track vendor purchase orders from draft through receipt and invoice matching"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Orders" value={orders.length} icon={FileText} />
                    <StatCard
                        title="Total Value"
                        value={formatCurrency(totalValue)}
                        icon={DollarSign}
                    />
                    <StatCard title="Issued / In Transit" value={issuedCount} icon={Truck} />
                    <StatCard title="Disputed" value={disputedCount} icon={Clock} />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                            <SearchInput
                                value={search}
                                onValueChange={setSearch}
                                placeholder="Search orders..."
                                className="flex-1"
                            />
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                    variant={statusFilter === "all" ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => setStatusFilter("all")}
                                >
                                    All ({orders.length})
                                </Badge>
                                {PO_STATUSES.map((s) => {
                                    const count = orders.filter((o) => o.status === s).length;
                                    return (
                                        <Badge
                                            key={s}
                                            variant={statusFilter === s ? "default" : "outline"}
                                            className="cursor-pointer capitalize"
                                            onClick={() => setStatusFilter(s)}
                                        >
                                            {s.replace("_", " ")} ({count})
                                        </Badge>
                                    );
                                })}
                            </div>
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="h-4 w-4" /> New PO
                            </Button>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                                <p>No purchase orders found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filtered.map((po) => (
                                    <Link
                                        key={po.id}
                                        href={`/purchase-orders/${po.id}`}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                {STATUS_ICONS[po.status] ?? (
                                                    <FileText className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold font-mono">
                                                    {po.id.slice(0, 8)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Issued{" "}
                                                    {po.issued_date
                                                        ? formatDate(po.issued_date)
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold">
                                                {formatCurrency(po.total_amount)}
                                            </span>
                                            <StatusBadge status={po.status}>
                                                {getStatusLabel(po.status)}
                                            </StatusBadge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <CreateEntityDialog
                config={CREATE_PURCHASE_ORDER_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
