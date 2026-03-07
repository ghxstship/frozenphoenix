"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContract, useDeleteContract, useUpdateContract } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
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

interface ContractDetail {
    id: string;
    title: string;
    contractNumber: string;
    type: ContractType;
    status: ContractStatusType;
    vendorName?: string;
    clientName?: string;
    value: number;
    effectiveDate: string;
    expirationDate: string;
    autoRenew: boolean;
    description: string;
    clauses: { title: string; summary: string }[];
    signatures: {
        name: string;
        email: string;
        role: string;
        status: SignatureStatusType;
        signedAt?: string;
    }[];
    amendments: { id: string; title: string; date: string; value: number }[];
    relatedDocuments: { name: string; type: string; uploadedAt: string }[];
}

const mockContract: ContractDetail = {
    id: "1",
    title: "Nike Master Services Agreement",
    contractNumber: "CTR-2026-0001",
    type: "msa",
    status: "active",
    clientName: "Nike",
    value: 2500000,
    effectiveDate: "2025-06-01",
    expirationDate: "2027-05-31",
    autoRenew: true,
    description:
        "Master Services Agreement covering all experiential marketing and brand activation services for Nike North America. Includes standard terms for fabrication, logistics, and on-site production management.",
    clauses: [
        {
            title: "Scope of Services",
            summary:
                "Full-service experiential marketing including design, fabrication, logistics, and on-site management.",
        },
        {
            title: "Payment Terms",
            summary:
                "Net 30 from invoice date. 50% deposit required for projects exceeding $100,000.",
        },
        {
            title: "Intellectual Property",
            summary:
                "All creative work produced under this agreement is owned by Client upon full payment.",
        },
        {
            title: "Limitation of Liability",
            summary: "Liability capped at total contract value. Excludes consequential damages.",
        },
        {
            title: "Termination",
            summary:
                "Either party may terminate with 90 days written notice. Immediate termination for material breach.",
        },
        {
            title: "Insurance Requirements",
            summary:
                "$5M general liability, $2M professional liability, workers' compensation as required by law.",
        },
    ],
    signatures: [
        {
            name: "Sarah Chen",
            email: "sarah.chen@company.com",
            role: "CEO",
            status: "signed",
            signedAt: "2025-05-28",
        },
        {
            name: "John Smith",
            email: "john.smith@nike.com",
            role: "VP Brand Experiences",
            status: "signed",
            signedAt: "2025-05-30",
        },
    ],
    amendments: [
        { id: "6", title: "Amendment #1 — Scope Extension", date: "2026-02-15", value: 350000 },
    ],
    relatedDocuments: [
        { name: "Nike MSA - Executed Copy.pdf", type: "contract", uploadedAt: "2025-06-01" },
        { name: "Insurance Certificate 2026.pdf", type: "insurance", uploadedAt: "2026-01-15" },
        { name: "W-9 Form.pdf", type: "tax", uploadedAt: "2025-05-20" },
    ],
};

type TabId = "details" | "signatures" | "documents" | "chatter";
const TAB_VALUES = ["details", "signatures", "documents", "chatter"] as const;

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord } = useContract(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Contract",
        listPath: "/contracts",
        useUpdateHook: useUpdateContract,
        useDeleteHook: useDeleteContract,
    });
    void router;
    void sbRecord;
    void handleUpdate;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });
    const contract = mockContract;
    const statusCfg = CONTRACT_STATUS_MAP[contract.status];
    const typeCfg = CONTRACT_TYPE_MAP[contract.type];
    const { addToast } = useToast();

    const handleExportPDF = () => {
        addToast({
            title: "Export Started",
            description: `Generating PDF for ${contract.contractNumber}. This may take a moment.`,
            variant: "info",
        });
    };

    const handleSendForSignature = () => {
        addToast({
            title: "Signature Request Sent",
            description: `Signature request has been sent for ${contract.contractNumber}.`,
            variant: "success",
        });
    };

    const daysUntilExpiry = useMemo(() => {
        const now = new Date();
        return Math.ceil(
            (new Date(contract.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
    }, [contract.expirationDate]);

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
        { id: "signatures" as const, label: "Signatures", count: contract.signatures.length },
        { id: "documents" as const, label: "Documents", count: contract.relatedDocuments.length },
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
                        <span className="font-bold">{formatCurrency(contract.value)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Counterparty</span>
                        <span className="font-medium">
                            {contract.clientName || contract.vendorName}
                        </span>
                    </div>
                    {contract.autoRenew && (
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
                            <p className="font-medium">{formatDate(contract.effectiveDate)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Expiration Date</p>
                            <p className="font-medium">{formatDate(contract.expirationDate)}</p>
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
            title={contract.title}
            subtitle={`${contract.contractNumber} · ${typeCfg?.label}`}
            status={contract.status}
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
                { label: "Duplicate Contract", onClick: () => {} },
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
                                            {formatCurrency(contract.value)}
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
                                            {formatDate(contract.effectiveDate)} —{" "}
                                            {formatDate(contract.expirationDate)}
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
                                            {contract.clientName || contract.vendorName}
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
                                {contract.description}
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
                                {contract.clauses.map((clause, i) => (
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

                    {contract.amendments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileSignature className="h-4 w-4" />
                                    Amendments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {contract.amendments.map((amend) => (
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
                            {contract.signatures.map((sig, i) => {
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
                            {contract.relatedDocuments.map((doc, i) => (
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
                                    <Button variant="ghost" size="sm">
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
                    recordId={contract.id}
                    activityItems={makeMockActivity("contract")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
