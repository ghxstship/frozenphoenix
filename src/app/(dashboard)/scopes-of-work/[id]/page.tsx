"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useDeleteScopeOfWork,
    useScopeOfWork,
    useUpdateScopeOfWork,
} from "@/lib/supabase/hooks-pages";
import { LoadingState } from "@/components/layouts/loading-state";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import { Building2, Calendar, CheckCircle2, Clock, DollarSign, FileText, Send } from "lucide-react";

type TabId = "overview" | "deliverables" | "chatter";
const TAB_VALUES = ["overview", "deliverables", "chatter"] as const;

interface DeliverableItem {
    id: string;
    name: string;
    status: string;
    dueDate: string;
    value: number;
}

function parseDeliverables(raw: unknown): DeliverableItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((d, i) => ({
        id: String(d.id ?? `d-${i}`),
        name: (d.name as string) ?? "",
        status: (d.status as string) ?? "pending",
        dueDate: (d.due_date as string) ?? (d.dueDate as string) ?? "",
        value: (d.value as number) ?? 0,
    }));
}

export default function ScopeOfWorkDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord, isLoading } = useScopeOfWork(entityId);
    const sow = sbRecord as Record<string, unknown> | null;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Scope of Work",
        listPath: "/scopes-of-work",
        useUpdateHook: useUpdateScopeOfWork,
        useDeleteHook: useDeleteScopeOfWork,
    });
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });

    const sowNumber = (sow?.number as string) ?? "";
    const sowTitle = (sow?.title as string) ?? "";
    const project = (sow?.project as string) ?? (sow?.project_name as string) ?? "";
    const client = (sow?.client as string) ?? (sow?.client_name as string) ?? "";
    const sowStatus = (sow?.status as string) ?? "draft";
    const totalValue = (sow?.total_value as number) ?? (sow?.totalValue as number) ?? 0;
    const invoiced = (sow?.invoiced as number) ?? 0;
    const effectiveDate = (sow?.effective_date as string) ?? (sow?.effectiveDate as string) ?? "";
    const expirationDate = (sow?.expiration_date as string) ?? (sow?.expirationDate as string) ?? "";
    const billingType = (sow?.billing_type as string) ?? (sow?.billingType as string) ?? "";
    const paymentTerms = (sow?.payment_terms as string) ?? (sow?.paymentTerms as string) ?? "";
    const sowDescription = (sow?.description as string) ?? "";
    const deliverables = parseDeliverables(sow?.deliverables);
    const completedDeliverables = deliverables.filter((d) => d.status === "completed").length;
    const deliverableCount = deliverables.length;

    const deliverableProgress =
        deliverableCount > 0
            ? Math.round((completedDeliverables / deliverableCount) * 100)
            : 0;
    const invoicedPct =
        totalValue > 0 ? Math.round((invoiced / totalValue) * 100) : 0;

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

    if (isLoading) return <LoadingState />;

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "deliverables" as const, label: "Deliverables", count: deliverableCount },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">SOW Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {sowNumber && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Number</span>
                            <span className="font-mono font-medium">{sowNumber}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(sowStatus)}>
                            {getStatusLabel(sowStatus)}
                        </Badge>
                    </div>
                    {billingType && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Billing</span>
                            <span className="font-medium capitalize">
                                {billingType.replace(/_/g, " ")}
                            </span>
                        </div>
                    )}
                    {paymentTerms && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Terms</span>
                            <span className="font-medium">{paymentTerms}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{client || "—"}</span>
                    </div>
                    {project && <p className="text-xs text-muted-foreground">{project}</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Financials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-bold">{formatCurrency(totalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Invoiced</span>
                        <span className="font-medium">{formatCurrency(invoiced)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-medium">
                            {formatCurrency(totalValue - invoiced)}
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
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleUpdate({ status: "pending_approval" })}>
                        <Send className="mr-2 h-4 w-4" />
                        Send for Approval
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => router.push(`/invoices/new?fromSow=${entityId}`)}>
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
            entityType="scopes-of-work"
            entityId={entityId}
            title={sowTitle}
            subtitle={`${sowNumber} · ${client}`}
            status={sowStatus}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm" onClick={() => handleUpdate({ status: "pending_approval" })}>
                    <Send className="h-4 w-4 mr-1" />
                    Send for Approval
                </Button>
            }
            menuItems={[
                { label: "Edit SOW", onClick: () => router.push(`/scopes-of-work/${entityId}/edit`) },
                { label: "Create Amendment", onClick: () => handleUpdate({ status: "amendment_requested" }) },
                ...crudMenuItems,
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
                                            {formatCurrency(totalValue)}
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
                                            {completedDeliverables}/
                                            {deliverableCount}
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
                                            {effectiveDate ? formatDate(effectiveDate, "compact") : "TBD"}
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
                                {deliverableProgress}% complete — {completedDeliverables} of{" "}
                                {deliverableCount} deliverables finished
                            </p>
                        </CardContent>
                    </Card>

                    {sowDescription && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {sowDescription}
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
                                        {effectiveDate ? formatDate(effectiveDate, "long") : "TBD"}
                                    </p>
                                </div>
                                <span className="text-muted-foreground">→</span>
                                <div>
                                    <p className="text-xs text-muted-foreground">Expiration</p>
                                    <p className="font-medium">
                                        {expirationDate ? formatDate(expirationDate, "long") : "TBD"}
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
                            Deliverables ({deliverableCount})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {deliverables.map((del) => (
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
                    recordId={entityId}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
