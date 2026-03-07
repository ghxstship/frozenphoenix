"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteExpense, useExpense, useUpdateExpense } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { EXPENSE_CATEGORY_LABELS, getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Calendar,
    CheckCircle2,
    DollarSign,
    FolderOpen,
    Receipt,
    Upload,
    User,
} from "lucide-react";

type TabId = "details" | "receipt" | "chatter";
const TAB_VALUES = ["details", "receipt", "chatter"] as const;

const mockExpense = {
    id: "1",
    description: "Flight to NYC — site visit",
    category: "travel" as const,
    amount: 485,
    date: "2026-02-20",
    submittedBy: "Sarah Chen",
    projectName: "Nike Air Max Launch",
    status: "pending" as const,
    receiptUrl: undefined as string | undefined,
    approvedBy: undefined as string | undefined,
    approvedAt: undefined as string | undefined,
    notes: "Round-trip JFK. Economy class per policy. Receipts attached.",
    reimbursementMethod: "Direct Deposit",
    costCenter: "PROD-2026-001",
};

export default function ExpenseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord } = useExpense(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Expense",
        listPath: "/expenses",
        useUpdateHook: useUpdateExpense,
        useDeleteHook: useDeleteExpense,
    });
    void router;
    void sbRecord;
    void handleUpdate;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());
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

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "receipt" as const, label: "Receipt" },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Expense Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(mockExpense.status)}>
                            {getStatusLabel(mockExpense.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold">{formatCurrency(mockExpense.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="outline">
                            {EXPENSE_CATEGORY_LABELS[mockExpense.category] ?? mockExpense.category}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{formatDate(mockExpense.date)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost Center</span>
                        <span className="font-mono text-xs">{mockExpense.costCenter}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Submitted By</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{mockExpense.submittedBy}</p>
                            <p className="text-xs text-muted-foreground">
                                {mockExpense.projectName}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Receipt
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/expenses"
            backLabel="Expenses"
            entityType="expenses"
            entityId={entityId}
            title={mockExpense.description}
            subtitle={`${EXPENSE_CATEGORY_LABELS[mockExpense.category] ?? mockExpense.category} · ${mockExpense.projectName}`}
            status={mockExpense.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Receipt className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                </Button>
            }
            menuItems={[{ label: "Edit Expense", onClick: () => {} }, ...crudMenuItems]}
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
                                        <p className="text-xs text-muted-foreground">Amount</p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(mockExpense.amount)}
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
                                        <p className="text-xs text-muted-foreground">Date</p>
                                        <p className="text-sm font-semibold">
                                            {formatDate(mockExpense.date)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <FolderOpen className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Project</p>
                                        <p className="text-sm font-semibold">
                                            {mockExpense.projectName}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {mockExpense.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {mockExpense.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Reimbursement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-medium">
                                    {mockExpense.reimbursementMethod}
                                </span>
                            </div>
                            {mockExpense.approvedBy && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Approved By</span>
                                    <span className="font-medium">{mockExpense.approvedBy}</span>
                                </div>
                            )}
                            {mockExpense.approvedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Approved At</span>
                                    <span className="font-medium">
                                        {formatDate(mockExpense.approvedAt)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "receipt" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Receipt</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mockExpense.receiptUrl ? (
                            <div className="rounded-lg border overflow-hidden">
                                <div className="h-64 bg-secondary/30 flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">Receipt preview</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Upload className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground">No receipt uploaded</p>
                                <Button variant="outline" size="sm" className="mt-3">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Receipt
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="expense"
                    recordId={mockExpense.id}
                    activityItems={makeMockActivity("expense")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
