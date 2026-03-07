"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useClientInvoice,
    useDeleteClientInvoice,
    useUpdateClientInvoice,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { EmptyState } from "@/components/layouts/empty-state";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import { Calendar, DollarSign, FileText, Loader2 } from "lucide-react";

type TabId = "overview" | "line-items" | "chatter";
const TAB_VALUES = ["overview", "line-items", "chatter"] as const;

export default function ClientInvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: invoice, isLoading } = useClientInvoice(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Client Invoice",
        listPath: "/client-invoices",
        useUpdateHook: useUpdateClientInvoice,
        useDeleteHook: useDeleteClientInvoice,
    });
    void router;
    void handleUpdate;

    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const inv = invoice as Record<string, unknown> | undefined;
    if (!inv) {
        return (
            <EmptyState
                icon={FileText}
                title="Client invoice not found"
                description="This invoice may have been removed."
            />
        );
    }

    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "You",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "line-items" as const, label: "Line Items" },
        { id: "chatter" as const, label: "Activity" },
    ];

    const sidebar = (
        <div className="space-y-4 text-sm">
            <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-medium capitalize">{String(inv.status ?? "draft")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Amount</span>
                <p className="font-medium">
                    {formatCurrency(Number(inv.total_amount ?? inv.amount ?? 0))}
                </p>
            </div>
            <div>
                <span className="text-muted-foreground">Due Date</span>
                <p className="font-medium">
                    {inv.due_date ? formatDate(String(inv.due_date)) : "—"}
                </p>
            </div>
            <div>
                <span className="text-muted-foreground">Issued</span>
                <p className="font-medium">
                    {inv.issued_date ? formatDate(String(inv.issued_date)) : "—"}
                </p>
            </div>
        </div>
    );

    return (
        <DetailLayout
            backHref="/client-invoices"
            backLabel="Client Invoices"
            entityType="client-invoices"
            entityId={entityId}
            title={String(inv.invoice_number ?? inv.number ?? `INV-${entityId.slice(0, 8)}`)}
            subtitle="Client Invoice"
            status={String(inv.status ?? "draft")}
            menuItems={[...crudMenuItems]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <DollarSign className="h-4 w-4" /> Total Amount
                                </div>
                                <p className="text-2xl font-semibold mt-1">
                                    {formatCurrency(Number(inv.total_amount ?? inv.amount ?? 0))}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" /> Due Date
                                </div>
                                <p className="text-2xl font-semibold mt-1">
                                    {inv.due_date ? formatDate(String(inv.due_date)) : "—"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" /> Paid Amount
                                </div>
                                <p className="text-2xl font-semibold mt-1">
                                    {formatCurrency(Number(inv.paid_amount ?? 0))}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p>{String(inv.notes ?? inv.description ?? "No notes.")}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
            {activeTab === "line-items" && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Line items coming soon.
                    </CardContent>
                </Card>
            )}
            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="client_invoice"
                    recordId={entityId}
                    comments={chatterComments}
                    activityItems={makeMockActivity("client_invoice")}
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
