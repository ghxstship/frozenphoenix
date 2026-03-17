"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContract, useDeleteContract, useUpdateContract } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
    CONTRACT_STATUS_MAP,
    CONTRACT_TYPE_MAP,
    type ContractStatusType,
    type ContractType,
    SIGNATURE_STATUSES,
    type SignatureStatusType,
} from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
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

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "contracts",
    titleKey: "title",
    subtitleFn: (r) => {
        const num = (r.contract_number as string) ?? (r.contractNumber as string) ?? "";
        const t = ((r.type as string) ?? (r.contract_type as string) ?? "msa") as ContractType;
        return `${num} · ${CONTRACT_TYPE_MAP[t]?.label ?? t}`;
    },
    statusKey: "status",
    icon: FileSignature,
    backHref: "/contracts",
    backLabel: "Contracts",
    chatterRecordType: "contract",
    fields: [
        { id: "description", label: "Description", accessorKey: "description", fullWidth: true },
        {
            id: "value",
            label: "Contract Value",
            accessorKey: "value",
            fieldType: "currency",
            icon: DollarSign,
        },
        {
            id: "effective_date",
            label: "Effective Date",
            accessorKey: "effective_date",
            fieldType: "date",
            icon: Calendar,
        },
        {
            id: "expiration_date",
            label: "Expiration Date",
            accessorKey: "expiration_date",
            fieldType: "date",
            icon: Calendar,
        },
        { id: "auto_renew", label: "Auto-Renew", accessorKey: "auto_renew", fieldType: "boolean" },
        { id: "vendor_name", label: "Vendor", accessorKey: "vendor_name" },
        { id: "client_name", label: "Client", accessorKey: "client_name" },
    ],
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        { id: "type", label: "Type", accessorKey: "type", fieldType: "status" },
        { id: "value", label: "Value", accessorKey: "value", fieldType: "currency" },
        {
            id: "effective_date",
            label: "Effective Date",
            accessorKey: "effective_date",
            fieldType: "date",
        },
        {
            id: "expiration_date",
            label: "Expiration Date",
            accessorKey: "expiration_date",
            fieldType: "date",
        },
        { id: "auto_renew", label: "Auto-Renew", accessorKey: "auto_renew", fieldType: "boolean" },
    ],
    tabs: [],
};

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

    const contractNumber = (ct?.contract_number as string) ?? (ct?.contractNumber as string) ?? "";
    const contractType = ((ct?.type as string) ??
        (ct?.contract_type as string) ??
        "msa") as ContractType;
    const contractStatus = ((ct?.status as string) ?? "draft") as ContractStatusType;
    const vendorName = (ct?.vendor_name as string) ?? (ct?.vendorName as string) ?? "";
    const clientName = (ct?.client_name as string) ?? (ct?.clientName as string) ?? "";
    const _contractValue = (ct?.value as number) ?? 0;
    const effectiveDate = (ct?.effective_date as string) ?? (ct?.effectiveDate as string) ?? "";
    const expirationDate = (ct?.expiration_date as string) ?? (ct?.expirationDate as string) ?? "";
    const _autoRenew = (ct?.auto_renew as boolean) ?? (ct?.autoRenew as boolean) ?? false;
    const _contractDescription = (ct?.description as string) ?? "";
    const clauses = parseClauses(ct?.clauses);
    const signatures = parseSignatures(ct?.signatures);
    const amendments = parseAmendments(ct?.amendments);
    const relatedDocuments = parseDocs(ct?.related_documents ?? ct?.relatedDocuments);

    const _statusCfg = CONTRACT_STATUS_MAP[contractStatus];
    const _typeCfg = CONTRACT_TYPE_MAP[contractType];
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
        return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }, [expirationDate]);

    const sidebarSlot =
        daysUntilExpiry <= 90 && daysUntilExpiry > 0 ? (
            <Card className="border-warning/50 bg-warning/5">
                <CardContent className="pt-4">
                    <Badge variant="warning" className="w-full justify-center">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {daysUntilExpiry}d until expiry
                    </Badge>
                </CardContent>
            </Card>
        ) : undefined;

    const overviewSlot = (
        <div className="space-y-6">
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
                                            <p className="text-sm font-semibold">{amend.title}</p>
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
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Contract Value",
                icon: DollarSign,
                compute: (r) => formatCurrency(Number(r.value ?? 0)),
            },
            {
                label: "Effective Period",
                icon: Calendar,
                compute: () =>
                    `${effectiveDate ? formatDate(effectiveDate) : "TBD"} — ${expirationDate ? formatDate(expirationDate) : "TBD"}`,
            },
            {
                label: "Counterparty",
                icon: Building2,
                compute: () => clientName || vendorName || "—",
            },
        ],
        tabs: [
            {
                id: "signatures",
                label: "Signatures",
                content: (
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
                ),
            },
            {
                id: "documents",
                label: "Documents",
                content: (
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
                                                    {doc.type} · Uploaded{" "}
                                                    {formatDate(doc.uploadedAt)}
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
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={entityId}
            record={ct}
            isLoading={isLoading}
            menuItems={[
                { label: "Export PDF", onClick: handleExportPDF },
                {
                    label: "Duplicate Contract",
                    onClick: () => router.push(`/contracts/new?duplicateFrom=${entityId}`),
                },
                ...crudMenuItems,
            ]}
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
        />
    );
}
