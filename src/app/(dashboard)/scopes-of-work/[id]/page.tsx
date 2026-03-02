"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import { Building2, Calendar, CheckCircle2, Clock, DollarSign, FileText, Send } from "lucide-react";

type TabId = "overview" | "deliverables" | "chatter";
const TAB_VALUES = ["overview", "deliverables", "chatter"] as const;

const mockSOW = {
    id: "1",
    number: "SOW-2026-001",
    title: "Nike Air Max Launch — Full Production",
    project: "Nike Air Max Launch",
    client: "Nike",
    status: "active" as const,
    totalValue: 485000,
    invoiced: 242500,
    deliverableCount: 8,
    completedDeliverables: 4,
    effectiveDate: "2026-01-15",
    expirationDate: "2026-06-30",
    billingType: "fixed_price",
    paymentTerms: "Net 30",
    description:
        "Full production services for the Nike Air Max 2026 launch event including stage design, AV, fabrication, and on-site production management.",
};

const mockDeliverables = [
    {
        id: "d1",
        name: "Stage Design & CAD Drawings",
        status: "completed",
        dueDate: "2026-01-30",
        value: 35000,
    },
    {
        id: "d2",
        name: "AV System Design & Procurement",
        status: "completed",
        dueDate: "2026-02-10",
        value: 85000,
    },
    {
        id: "d3",
        name: "Stage Fabrication",
        status: "completed",
        dueDate: "2026-02-28",
        value: 120000,
    },
    {
        id: "d4",
        name: "Load-In & Technical Rehearsal",
        status: "completed",
        dueDate: "2026-03-05",
        value: 45000,
    },
    {
        id: "d5",
        name: "Show Day Production Management",
        status: "in_progress",
        dueDate: "2026-03-10",
        value: 60000,
    },
    {
        id: "d6",
        name: "Post-Event Strike & Wrap",
        status: "pending",
        dueDate: "2026-03-12",
        value: 40000,
    },
    {
        id: "d7",
        name: "Digital Content Capture",
        status: "in_progress",
        dueDate: "2026-03-10",
        value: 55000,
    },
    {
        id: "d8",
        name: "Post-Production & Deliverables",
        status: "pending",
        dueDate: "2026-03-30",
        value: 45000,
    },
];

export default function ScopeOfWorkDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });

    const deliverableProgress =
        mockSOW.deliverableCount > 0
            ? Math.round((mockSOW.completedDeliverables / mockSOW.deliverableCount) * 100)
            : 0;
    const invoicedPct =
        mockSOW.totalValue > 0 ? Math.round((mockSOW.invoiced / mockSOW.totalValue) * 100) : 0;

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
        { id: "overview" as const, label: "Overview" },
        { id: "deliverables" as const, label: "Deliverables", count: mockDeliverables.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">SOW Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Number</span>
                        <span className="font-mono font-medium">{mockSOW.number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(mockSOW.status)}>
                            {getStatusLabel(mockSOW.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Billing</span>
                        <span className="font-medium capitalize">
                            {mockSOW.billingType.replace(/_/g, " ")}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Terms</span>
                        <span className="font-medium">{mockSOW.paymentTerms}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{mockSOW.client}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{mockSOW.project}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Financials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-bold">{formatCurrency(mockSOW.totalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Invoiced</span>
                        <span className="font-medium">{formatCurrency(mockSOW.invoiced)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-medium">
                            {formatCurrency(mockSOW.totalValue - mockSOW.invoiced)}
                        </span>
                    </div>
                    <ProgressBar value={invoicedPct} size="sm" />
                    <p className="text-xs text-muted-foreground text-center">
                        {invoicedPct}% invoiced
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <Send className="mr-2 h-4 w-4" />
                        Send for Approval
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Invoice
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/scopes-of-work"
            backLabel="Scopes of Work"
            title={mockSOW.title}
            subtitle={`${mockSOW.number} · ${mockSOW.client}`}
            status={mockSOW.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm">
                    <Send className="h-4 w-4 mr-1" />
                    Send for Approval
                </Button>
            }
            menuItems={[
                { label: "Edit SOW", onClick: () => {} },
                { label: "Create Amendment", onClick: () => {} },
                { label: "Archive", onClick: () => {}, variant: "destructive" },
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Value</p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(mockSOW.totalValue)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Deliverables
                                        </p>
                                        <p className="text-lg font-bold">
                                            {mockSOW.completedDeliverables}/
                                            {mockSOW.deliverableCount}
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
                                        <p className="text-xs text-muted-foreground">
                                            Effective Date
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {formatDate(mockSOW.effectiveDate, "compact")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Deliverable Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProgressBar value={deliverableProgress} size="md" className="mb-2" />
                            <p className="text-sm text-muted-foreground">
                                {deliverableProgress}% complete — {mockSOW.completedDeliverables} of{" "}
                                {mockSOW.deliverableCount} deliverables finished
                            </p>
                        </CardContent>
                    </Card>

                    {mockSOW.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {mockSOW.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">Effective</p>
                                    <p className="font-medium">
                                        {formatDate(mockSOW.effectiveDate, "long")}
                                    </p>
                                </div>
                                <span className="text-muted-foreground">→</span>
                                <div>
                                    <p className="text-xs text-muted-foreground">Expiration</p>
                                    <p className="font-medium">
                                        {formatDate(mockSOW.expirationDate, "long")}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "deliverables" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Deliverables ({mockDeliverables.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockDeliverables.map((del) => (
                                <div
                                    key={del.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div className="flex items-center gap-3">
                                        {del.status === "completed" ? (
                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                        ) : (
                                            <Clock
                                                className={`h-4 w-4 ${del.status === "in_progress" ? "text-info" : "text-muted-foreground"}`}
                                            />
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold">{del.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Due {formatDate(del.dueDate, "compact")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">
                                            {formatCurrency(del.value)}
                                        </span>
                                        <Badge variant={getStatusVariant(del.status)}>
                                            {getStatusLabel(del.status)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="scope_of_work"
                    recordId={mockSOW.id}
                    activityItems={makeMockActivity("scope_of_work")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
