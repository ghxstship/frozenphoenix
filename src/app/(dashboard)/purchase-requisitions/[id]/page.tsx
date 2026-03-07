"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useDeletePurchaseRequisition,
    usePurchaseRequisition,
    useUpdatePurchaseRequisition,
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
import { Calendar, ClipboardList, DollarSign, Loader2, Send, User } from "lucide-react";

type TabId = "details" | "line-items" | "chatter";
const TAB_VALUES = ["details", "line-items", "chatter"] as const;

const URGENCY_VARIANTS: Record<string, "destructive" | "warning" | "default" | "success"> = {
    critical: "destructive",
    high: "warning",
    normal: "default",
    low: "success",
};

export default function PurchaseRequisitionDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: req, isLoading } = usePurchaseRequisition(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Requisition",
        listPath: "/purchase-requisitions",
        useUpdateHook: useUpdatePurchaseRequisition,
        useDeleteHook: useDeletePurchaseRequisition,
    });
    void router;
    void handleUpdate;

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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!req) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Record not found</p>
            </div>
        );
    }

    const lineItems = (req.line_items as Array<Record<string, unknown>>) ?? [];

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "line-items" as const, label: "Line Items", count: lineItems.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Requisition Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Number</span>
                        <span className="font-mono font-medium">{req.number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(req.status)}>
                            {getStatusLabel(req.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Urgency</span>
                        <Badge variant={URGENCY_VARIANTS[req.urgency] ?? "default"}>
                            {req.urgency}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Cost</span>
                        <span className="font-bold">
                            {formatCurrency(Number(req.estimated_cost))}
                        </span>
                    </div>
                    {req.needed_by && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Needed By</span>
                            <span className="font-medium">{formatDate(req.needed_by)}</span>
                        </div>
                    )}
                    {req.department && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Department</span>
                            <span>{req.department}</span>
                        </div>
                    )}
                    {req.budget_code && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget Code</span>
                            <span className="font-mono text-xs">{req.budget_code}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/purchase-requisitions"
            backLabel="Purchase Requisitions"
            entityType="purchase-requisitions"
            entityId={entityId}
            title={req.title}
            subtitle={`${req.number} · ${req.department ?? "No Department"}`}
            status={req.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <ClipboardList className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                req.status === "draft" ? (
                    <Button size="sm">
                        <Send className="h-4 w-4 mr-1" />
                        Submit for Approval
                    </Button>
                ) : undefined
            }
            menuItems={[{ label: "Edit Requisition", onClick: () => {} }, ...crudMenuItems]}
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
                                            Estimated Cost
                                        </p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(Number(req.estimated_cost))}
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
                                        <p className="text-xs text-muted-foreground">Needed By</p>
                                        <p className="text-sm font-semibold">
                                            {req.needed_by
                                                ? formatDate(req.needed_by)
                                                : "No deadline"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Line Items</p>
                                        <p className="text-sm font-semibold">{lineItems.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {req.justification && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Justification</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {req.justification}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {req.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {req.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "line-items" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Line Items ({lineItems.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lineItems.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No line items added yet.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-muted-foreground text-left">
                                            <th className="pb-2 font-medium">Description</th>
                                            <th className="pb-2 font-medium text-right">Qty</th>
                                            <th className="pb-2 font-medium text-right">
                                                Unit Price
                                            </th>
                                            <th className="pb-2 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineItems.map((item, i) => (
                                            <tr key={i} className="border-b last:border-0">
                                                <td className="py-2">
                                                    {(item.description as string) ?? "—"}
                                                </td>
                                                <td className="py-2 text-right">
                                                    {(item.quantity as number) ?? 1}
                                                </td>
                                                <td className="py-2 text-right">
                                                    {formatCurrency(
                                                        (item.unit_price as number) ?? 0
                                                    )}
                                                </td>
                                                <td className="py-2 text-right font-medium">
                                                    {formatCurrency(
                                                        ((item.quantity as number) ?? 1) *
                                                            ((item.unit_price as number) ?? 0)
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="purchase_requisition"
                    recordId={req.id}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
