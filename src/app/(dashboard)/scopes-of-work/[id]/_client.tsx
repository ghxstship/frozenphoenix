"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useDeleteScopeOfWork,
    useScopeOfWork,
    useSOWChangeLog,
    useSOWDeliverables,
    useSOWDeliverableSummary,
    useUpdateScopeOfWork,
} from "@/lib/supabase";
import { useCollaboratorRequirements } from "@/lib/supabase/hooks-collaborators";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { EmptyState } from "@/components/layouts/empty-state";
import {
    Building2,
    Calendar,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    DollarSign,
    FileText,
    History,
    Loader2,
    PieChart,
    Send,
    Users,
} from "lucide-react";

function SOWDeliverablesTab({ sowId }: { sowId: string }) {
    const { data: deliverables, isLoading } = useSOWDeliverables(sowId);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!deliverables || deliverables.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5" />
                        DB Deliverables
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={ClipboardCheck}
                        title="No deliverables"
                        description="SOW deliverables from the database will appear here"
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5" />
                    DB Deliverables ({deliverables.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {deliverables.map((d) => {
                        const rec = d as Record<string, unknown>;
                        return (
                            <div
                                key={String(rec.id)}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {String(rec.name ?? rec.title ?? "Deliverable")}
                                    </p>
                                    {typeof rec.due_date === "string" ? (
                                        <p className="text-xs text-muted-foreground">
                                            Due: {formatDate(rec.due_date, "compact")}
                                        </p>
                                    ) : null}
                                </div>
                                <Badge variant={getStatusVariant(String(rec.status ?? "pending"))}>
                                    {getStatusLabel(String(rec.status ?? "pending"))}
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function SOWChangeLogTab({ sowId }: { sowId: string }) {
    const { data: changes, isLoading } = useSOWChangeLog(sowId);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!changes || changes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Change Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={History}
                        title="No changes"
                        description="SOW change history will appear here"
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Change Log ({changes.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {changes.map((c) => {
                        const rec = c as Record<string, unknown>;
                        return (
                            <div
                                key={String(rec.id)}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {String(rec.change_type ?? rec.action ?? "Change")}
                                    </p>
                                    {typeof rec.created_at === "string" ? (
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(rec.created_at, "compact")}
                                        </p>
                                    ) : null}
                                </div>
                                {rec.changed_by ? (
                                    <span className="text-xs text-muted-foreground">
                                        {String(rec.changed_by)}
                                    </span>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function SOWDeliverableSummaryTab({ sowId }: { sowId: string }) {
    const { data: summary, isLoading } = useSOWDeliverableSummary(sowId);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!summary || summary.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Deliverable Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={PieChart}
                        title="No summary data"
                        description="Deliverable summary metrics will appear here"
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Deliverable Summary
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {summary.map((s, idx) => {
                        const rec = s as Record<string, unknown>;
                        return (
                            <div
                                key={String(rec.id ?? idx)}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <p className="text-sm font-medium">
                                    {String(rec.status ?? rec.label ?? "Category")}
                                </p>
                                <Badge variant="secondary">
                                    {String(rec.count ?? rec.total ?? 0)}
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function CollaboratorRequirementsTab({ sowId }: { sowId: string }) {
    const { data: reqs, isLoading } = useCollaboratorRequirements(sowId, "");

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!reqs || reqs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Collaborator Requirements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={Users}
                        title="No requirements"
                        description="Collaborator requirements will appear here"
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Collaborator Requirements ({reqs.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {reqs.map((r) => {
                        const rec = r as Record<string, unknown>;
                        return (
                            <div
                                key={String(rec.id)}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {String(rec.requirement ?? rec.skill ?? "Requirement")}
                                    </p>
                                    {rec.priority ? (
                                        <p className="text-xs text-muted-foreground">
                                            Priority: {String(rec.priority)}
                                        </p>
                                    ) : null}
                                </div>
                                <Badge variant={rec.fulfilled ? "success" : "warning"}>
                                    {rec.fulfilled ? "Fulfilled" : "Needed"}
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "sow",
    titleKey: "title",
    statusKey: "status",
    icon: FileText,
    backHref: "/scopes-of-work",
    backLabel: "Scopes of Work",
    chatter: false,
    fields: [
        { id: "number", label: "Number", accessorKey: "number" },
        { id: "billing_type", label: "Billing", accessorKey: "billing_type", fieldType: "status" },
        { id: "payment_terms", label: "Payment Terms", accessorKey: "payment_terms" },
    ],
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        { id: "number", label: "Number", accessorKey: "number" },
        { id: "billing_type", label: "Billing", accessorKey: "billing_type", fieldType: "status" },
        { id: "payment_terms", label: "Payment Terms", accessorKey: "payment_terms" },
    ],
    tabs: [],
};

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

export function ScopeOfWorkDetailPageClient() {
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

    const sowNumber = (sow?.number as string) ?? "";
    const project = (sow?.project as string) ?? (sow?.project_name as string) ?? "";
    const client = (sow?.client as string) ?? (sow?.client_name as string) ?? "";
    const totalValue = (sow?.total_value as number) ?? (sow?.totalValue as number) ?? 0;
    const invoiced = (sow?.invoiced as number) ?? 0;
    const effectiveDate = (sow?.effective_date as string) ?? (sow?.effectiveDate as string) ?? "";
    const expirationDate =
        (sow?.expiration_date as string) ?? (sow?.expirationDate as string) ?? "";
    const billingType = (sow?.billing_type as string) ?? (sow?.billingType as string) ?? "";
    const paymentTerms = (sow?.payment_terms as string) ?? (sow?.paymentTerms as string) ?? "";
    const sowDescription = (sow?.description as string) ?? "";
    const deliverables = parseDeliverables(sow?.deliverables);
    const completedDeliverables = deliverables.filter((d) => d.status === "completed").length;
    const deliverableCount = deliverables.length;

    const deliverableProgress =
        deliverableCount > 0 ? Math.round((completedDeliverables / deliverableCount) * 100) : 0;
    const invoicedPct = totalValue > 0 ? Math.round((invoiced / totalValue) * 100) : 0;

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

    const sidebarSlot = (
        <div className="density-gap-section">
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
                        <span className="font-medium">{formatCurrency(totalValue - invoiced)}</span>
                    </div>
                    {billingType && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Billing</span>
                            <span className="font-medium capitalize">
                                {billingType.replaceAll("_", " ")}
                            </span>
                        </div>
                    )}
                    {paymentTerms && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Terms</span>
                            <span className="font-medium">{paymentTerms}</span>
                        </div>
                    )}
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
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleUpdate({ status: "pending_approval" })}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Send for Approval
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => router.push(`/invoices/new?fromSow=${entityId}`)}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Invoice
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    const overviewSlot = (
        <div className="density-gap-page">
            <div className="grid grid-cols-1 sm:grid-cols-3 density-gap-card">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Total Value</p>
                                <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <div>
                                <p className="text-xs text-muted-foreground">Deliverables</p>
                                <p className="text-lg font-bold">
                                    {completedDeliverables}/{deliverableCount}
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
                                <p className="text-xs text-muted-foreground">Effective Date</p>
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
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => `${sowNumber} · ${client}`,
        sidebarSlot,
        overviewSlot,
        stats: [
            { label: "Total Value", icon: DollarSign, compute: () => formatCurrency(totalValue) },
            {
                label: "Deliverables",
                icon: CheckCircle2,
                compute: () => `${completedDeliverables}/${deliverableCount}`,
            },
            {
                label: "Effective Date",
                icon: Calendar,
                compute: () => (effectiveDate ? formatDate(effectiveDate, "compact") : "TBD"),
            },
        ],
        tabs: [
            {
                id: "db-deliverables",
                label: "DB Deliverables",
                content: <SOWDeliverablesTab sowId={entityId} />,
            },
            {
                id: "change-log",
                label: "Change Log",
                content: <SOWChangeLogTab sowId={entityId} />,
            },
            {
                id: "deliverable-summary",
                label: "Summary",
                content: <SOWDeliverableSummaryTab sowId={entityId} />,
            },
            {
                id: "collab-requirements",
                label: "Requirements",
                content: <CollaboratorRequirementsTab sowId={entityId} />,
            },
            {
                id: "deliverables",
                label: "Deliverables",
                count: deliverableCount,
                content: (
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
                ),
            },
            {
                id: "chatter",
                label: "Chatter",
                content: (
                    <RecordChatter
                        recordType="scope_of_work"
                        recordId={entityId}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={entityId}
            record={sow}
            isLoading={isLoading}
            menuItems={[
                {
                    label: "Edit SOW",
                    onClick: () => router.push(`/scopes-of-work/${entityId}/edit`),
                },
                {
                    label: "Create Amendment",
                    onClick: () => handleUpdate({ status: "amendment_requested" }),
                },
                ...crudMenuItems,
            ]}
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
        />
    );
}
