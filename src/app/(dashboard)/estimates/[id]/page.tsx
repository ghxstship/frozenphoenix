"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteEstimate, useUpdateEstimate } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Building2,
    Calendar,
    Clock,
    DollarSign,
    FileSignature,
    FileText,
    Loader2,
    Send,
    User,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEstimate } from "@/lib/supabase/hooks-pages";

type TabId = "details" | "line-items" | "chatter";
const TAB_VALUES = ["details", "line-items", "chatter"] as const;

const mockLineItems = [
    {
        id: "li1",
        description: "Production Management",
        quantity: 1,
        unitPrice: 15000,
        total: 15000,
    },
    {
        id: "li2",
        description: "Technical Direction — Audio & Lighting",
        quantity: 1,
        unitPrice: 12000,
        total: 12000,
    },
    {
        id: "li3",
        description: "Stage Fabrication & Build",
        quantity: 1,
        unitPrice: 45000,
        total: 45000,
    },
    {
        id: "li4",
        description: "AV Equipment Rental (3 days)",
        quantity: 3,
        unitPrice: 8000,
        total: 24000,
    },
    {
        id: "li5",
        description: "Crew Labor — Load In/Out",
        quantity: 24,
        unitPrice: 450,
        total: 10800,
    },
    {
        id: "li6",
        description: "Transportation & Logistics",
        quantity: 1,
        unitPrice: 5200,
        total: 5200,
    },
];

export default function EstimateDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: estimate, isLoading } = useEstimate(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Estimate",
        listPath: "/estimates",
        useUpdateHook: useUpdateEstimate,
        useDeleteHook: useDeleteEstimate,
    });
    void router;
    void handleUpdate;

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!estimate) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Record not found</p>
            </div>
        );
    }

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "line-items" as const, label: "Line Items", count: mockLineItems.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Estimate Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Number</span>
                        <span className="font-mono font-medium">{estimate.number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(estimate.status)}>
                            {getStatusLabel(estimate.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold">{formatCurrency(estimate.total)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">{formatDate(estimate.createdAt)}</span>
                    </div>
                    {estimate.validUntil && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Valid Until</span>
                            <span className="font-medium">{formatDate(estimate.validUntil)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{estimate.companyName}</span>
                    </div>
                    {estimate.contactName && (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{estimate.contactName}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <Send className="mr-2 h-4 w-4" />
                        Send to Client
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Convert to Invoice
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/estimates"
            backLabel="Estimates"
            title={estimate.title}
            subtitle={`${estimate.number} · ${estimate.companyName}`}
            status={estimate.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileSignature className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm">
                    <Send className="h-4 w-4 mr-1" />
                    Send
                </Button>
            }
            menuItems={[
                { label: "Edit Estimate", onClick: () => {} },
                { label: "Duplicate", onClick: () => {} },
                { label: "Convert to Invoice", onClick: () => {} },
                ...crudMenuItems,
            ]}
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
                                        <p className="text-xs text-muted-foreground">Total</p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(estimate.total)}
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
                                        <p className="text-xs text-muted-foreground">Created</p>
                                        <p className="text-sm font-semibold">
                                            {formatDate(estimate.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Valid Until</p>
                                        <p className="text-sm font-semibold">
                                            {estimate.validUntil
                                                ? formatDate(estimate.validUntil)
                                                : "No expiry"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {estimate.clientNotes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {estimate.clientNotes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "line-items" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Line Items ({mockLineItems.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-3 py-2">
                                <span className="col-span-5">Description</span>
                                <span className="col-span-2 text-right">Qty</span>
                                <span className="col-span-2 text-right">Unit Price</span>
                                <span className="col-span-3 text-right">Total</span>
                            </div>
                            {mockLineItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg bg-secondary/20 text-sm"
                                >
                                    <span className="col-span-5 font-medium">
                                        {item.description}
                                    </span>
                                    <span className="col-span-2 text-right text-muted-foreground">
                                        {item.quantity}
                                    </span>
                                    <span className="col-span-2 text-right text-muted-foreground">
                                        {formatCurrency(item.unitPrice)}
                                    </span>
                                    <span className="col-span-3 text-right font-medium">
                                        {formatCurrency(item.total)}
                                    </span>
                                </div>
                            ))}
                            <div className="grid grid-cols-12 gap-2 px-3 py-3 border-t font-semibold text-sm">
                                <span className="col-span-9">Total</span>
                                <span className="col-span-3 text-right">
                                    {formatCurrency(mockLineItems.reduce((s, i) => s + i.total, 0))}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="estimate"
                    recordId={estimate.id}
                    activityItems={makeMockActivity("estimate")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
