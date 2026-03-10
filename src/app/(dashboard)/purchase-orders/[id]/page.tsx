"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useDeletePurchaseOrder,
    usePurchaseOrder,
    useUpdatePurchaseOrder,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, DollarSign, FileText, Loader2, Package, Truck } from "lucide-react";

type TabId = "details" | "items" | "chatter";
const TAB_VALUES = ["details", "items", "chatter"] as const;

export default function PurchaseOrderDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: po, isLoading } = usePurchaseOrder(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Purchase Order",
        listPath: "/purchase-orders",
        useUpdateHook: useUpdatePurchaseOrder,
        useDeleteHook: useDeletePurchaseOrder,
    });

    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);
    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Sarah Chen",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    if (!po) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Record not found</p>
            </div>
        );
    }

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "items" as const, label: "Line Items" },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">PO Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ID</span>
                        <span className="font-mono font-medium text-xs">{po.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(po.status)}>
                            {getStatusLabel(po.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold">{formatCurrency(Number(po.total_amount))}</span>
                    </div>
                    {po.issued_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Issued</span>
                            <span className="font-medium">{formatDate(po.issued_date)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/purchase-orders"
            backLabel="Purchase Orders"
            entityType="purchase-orders"
            entityId={entityId}
            title={`PO ${po.id.slice(0, 8)}`}
            subtitle={`Issued ${po.issued_date ? formatDate(po.issued_date) : "—"}`}
            status={po.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                po.status === "draft" ? (
                    <Button size="sm" onClick={() => console.log("Issue PO:", entityId)}>
                        <Truck className="h-4 w-4 mr-1" />
                        Issue PO
                    </Button>
                ) : po.status === "issued" ? (
                    <Button size="sm" onClick={() => console.log("Mark received:", entityId)}>
                        <Package className="h-4 w-4 mr-1" />
                        Mark Received
                    </Button>
                ) : undefined
            }
            menuItems={[{ label: "Edit Purchase Order", onClick: () => router.push(`/purchase-orders/${entityId}/edit`) }, ...crudMenuItems]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "details" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Total Amount
                                        </p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(Number(po.total_amount))}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-info" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Issue Date</p>
                                        <p className="text-sm font-semibold">
                                            {po.issued_date ? formatDate(po.issued_date) : "TBD"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Truck className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Vendor</p>
                                        <p className="text-sm font-semibold font-mono">
                                            {po.vendor_id ? String(po.vendor_id).slice(0, 8) : "—"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === "items" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Line Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Line items will load from the purchase_order_items table once linked.
                        </p>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="purchase_order"
                    recordId={po.id}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
