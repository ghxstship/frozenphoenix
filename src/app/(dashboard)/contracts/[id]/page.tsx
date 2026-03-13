"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContract, useDeleteContract, useUpdateContract } from "@/lib/supabase/hooks-pages";
import { LoadingState } from "@/components/layouts/loading-state";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import {
    CONTRACT_STATUS_MAP,
    CONTRACT_TYPE_MAP,
    type ContractStatusType,
    type ContractType,
    SIGNATURE_STATUSES,
    type SignatureStatusType,
} from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    AlertTriangle,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Download,
    FileSignature,
    FileText,
    PenTool,
    Send,
    Shield,
} from "lucide-react";

interface ClauseItem {
    title: string;
    summary: string;
}
interface SignatureItem {
    name: string;
    email: string;
    role: string;
    status: SignatureStatusType;
    signedAt?: string;
}
interface AmendmentItem {
    id: string;
    title: string;
    date: string;
    value: number;
}
interface DocItem {
    name: string;
    type: string;
    uploadedAt: string;
}

function parseClauses(raw: unknown): ClauseItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((c) => ({
        title: (c.title as string) ?? "",
        summary: (c.summary as string) ?? "",
    }));
}

function parseSignatures(raw: unknown): SignatureItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((s) => ({
        name: (s.name as string) ?? "",
        email: (s.email as string) ?? "",
        role: (s.role as string) ?? "",
        status: ((s.status as string) ?? "pending") as SignatureStatusType,
        signedAt: (s.signed_at as string) ?? (s.signedAt as string) ?? undefined,
    }));
}

function parseAmendments(raw: unknown): AmendmentItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((a, i) => ({
        id: String(a.id ?? `a-${i}`),
        title: (a.title as string) ?? "",
        date: (a.date as string) ?? "",
        value: (a.value as number) ?? 0,
    }));
}

function parseDocs(raw: unknown): DocItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((d) => ({
        name: (d.name as string) ?? "",
        type: (d.type as string) ?? "",
        uploadedAt: (d.uploaded_at as string) ?? (d.uploadedAt as string) ?? "",
    }));
}

type TabId = "details" | "signatures" | "documents" | "chatter";
const TAB_VALUES = ["details", "signatures", "documents", "chatter"] as const;

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord, isLoading } = useContract(entityId);
    const ct = sbRecord as Record<string, unknown> | null;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Contract",
        listPath: "/contracts",
        useUpdateHook: useUpdateContract,
        useDeleteHook: useDeleteContract,
    });
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });
    const contractTitle = (ct?.title as string) ?? "";
    const contractNumber = (ct?.contract_number as string) ?? (ct?.contractNumber as string) ?? "";
    const contractType = ((ct?.type as string) ??
        (ct?.contract_type as string) ??
        "msa") as ContractType;
    const contractStatus = ((ct?.status as string) ?? "draft") as ContractStatusType;
    const vendorName = (ct?.vendor_name as string) ?? (ct?.vendorName as string) ?? "";
    const clientName = (ct?.client_name as string) ?? (ct?.clientName as string) ?? "";
    const contractValue = (ct?.value as number) ?? 0;
    const effectiveDate = (ct?.effective_date as string) ?? (ct?.effectiveDate as string) ?? "";
    const expirationDate = (ct?.expiration_date as string) ?? (ct?.expirationDate as string) ?? "";
    const autoRenew = (ct?.auto_renew as boolean) ?? (ct?.autoRenew as boolean) ?? false;
    const contractDescription = (ct?.description as string) ?? "";
    const clauses = parseClauses(ct?.clauses);
    const signatures = parseSignatures(ct?.signatures);
    const amendments = parseAmendments(ct?.amendments);
    const relatedDocuments = parseDocs(ct?.related_documents ?? ct?.relatedDocuments);

    const statusCfg = CONTRACT_STATUS_MAP[contractStatus];
    const typeCfg = CONTRACT_TYPE_MAP[contractType];
    const { addToast } = useToast();

    const handleExportPDF = () => {
        addToast({
            title: "Export Started",
            description: `Generating PDF for ${contractNumber}. This may take a moment.`,
            variant: "info",
        });
    };

    const handleSendForSignature = () => {
        addToast({
            title: "Signature Request Sent",
            description: `Signature request has been sent for ${contractNumber}.`,
            variant: "success",
        });
    };

    const daysUntilExpiry = useMemo(() => {
        if (!expirationDate) return Infinity;
        const now = new Date();
        return Math.ceil(
            (new Date(expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
    }, [expirationDate]);

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
        { id: "details" as const, label: "Details" },
        { id: "signatures" as const, label: "Signatures", count: signatures.length },
        { id: "documents" as const, label: "Documents", count: relatedDocuments.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Contract Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusCfg?.variant}>{statusCfg?.label}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant={typeCfg?.variant}>{typeCfg?.label}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Value</span>
                        <span className="font-bold">{formatCurrency(contractValue)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Counterparty</span>
                        <span className="font-medium">{clientName || vendorName || "—"}</span>
                    </div>
                    {autoRenew && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Auto-Renew</span>
                            <Badge variant="success">Yes</Badge>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Effective Date</p>
                            <p className="font-medium">
                                {effectiveDate ? formatDate(effectiveDate) : "TBD"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Expiration Date</p>
                            <p className="font-medium">
                                {expirationDate ? formatDate(expirationDate) : "TBD"}
                            </p>
                        </div>
                    </div>
                    {daysUntilExpiry <= 90 && daysUntilExpiry > 0 && (
                        <Badge variant="warning" className="w-full justify-center">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {daysUntilExpiry}d until expiry
                        </Badge>
                    )}
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
                        onClick={handleExportPDF}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={handleSendForSignature}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Send for Signature
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/contracts"
            backLabel="Contracts"
            entityType="contracts"
            entityId={entityId}
            title={contractTitle}
            subtitle={`${contractNumber} · ${typeCfg?.label}`}
            status={contractStatus}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileSignature className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm" onClick={handleSendForSignature}>
                    <Send className="h-4 w-4 mr-1" />
                    Send for Signature
                </Button>
            }
            menuItems={[
                { label: "Export PDF", onClick: handleExportPDF },
                {
                    label: "Duplicate Contract",
                    onClick: () => router.push(`/contracts/new?duplicateFrom=${entityId}`),
                },
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
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Contract Value
                                        </p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(contractValue)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-info" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Effective Period
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {effectiveDate ? formatDate(effectiveDate) : "TBD"} —{" "}
                                            {expirationDate ? formatDate(expirationDate) : "TBD"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-secondary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Counterparty
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {clientName || vendorName || "—"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {contractDescription || "No description provided."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Key Clauses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {clauses.map((clause, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-secondary/30">
                                        <h4 className="text-sm font-semibold">{clause.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {clause.summary}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {amendments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileSignature className="h-4 w-4" />
                                    Amendments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {amendments.map((amend) => (
                                        <Link key={amend.id} href={`/contracts/${amend.id}`}>
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {amend.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(amend.date)}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold">
                                                    {formatCurrency(amend.value)}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "signatures" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <PenTool className="h-4 w-4" />
                            Signatures
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {signatures.map((sig, i) => {
                                const sigStatus = SIGNATURE_STATUSES.find(
                                    (s) => s.value === sig.status
                                );
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold">{sig.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {sig.role} · {sig.email}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {sig.status === "signed" && sig.signedAt && (
                                                <span className="text-xs text-muted-foreground">
                                                    Signed {formatDate(sig.signedAt)}
                                                </span>
                                            )}
                                            <Badge variant={sigStatus?.variant}>
                                                {sig.status === "signed" ? (
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <Clock className="mr-1 h-3 w-3" />
                                                )}
                                                {sigStatus?.label}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "documents" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Related Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {relatedDocuments.map((doc, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {doc.type} · Uploaded {formatDate(doc.uploadedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" disabled>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="contract"
                    recordId={entityId}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
