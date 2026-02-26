"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { CONTRACT_STATUS_MAP, CONTRACT_TYPE_MAP, SIGNATURE_STATUSES, type ContractStatusType, type ContractType, type SignatureStatusType } from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    FileSignature, ArrowLeft, Calendar, Building2, DollarSign,
    Download, Send, CheckCircle2, Clock, PenTool, FileText,
    AlertTriangle, Shield,
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
    signatures: { name: string; email: string; role: string; status: SignatureStatusType; signedAt?: string }[];
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
    description: "Master Services Agreement covering all experiential marketing and brand activation services for Nike North America. Includes standard terms for fabrication, logistics, and on-site production management.",
    clauses: [
        { title: "Scope of Services", summary: "Full-service experiential marketing including design, fabrication, logistics, and on-site management." },
        { title: "Payment Terms", summary: "Net 30 from invoice date. 50% deposit required for projects exceeding $100,000." },
        { title: "Intellectual Property", summary: "All creative work produced under this agreement is owned by Client upon full payment." },
        { title: "Limitation of Liability", summary: "Liability capped at total contract value. Excludes consequential damages." },
        { title: "Termination", summary: "Either party may terminate with 90 days written notice. Immediate termination for material breach." },
        { title: "Insurance Requirements", summary: "$5M general liability, $2M professional liability, workers' compensation as required by law." },
    ],
    signatures: [
        { name: "Sarah Chen", email: "sarah.chen@company.com", role: "CEO", status: "signed", signedAt: "2025-05-28" },
        { name: "John Smith", email: "john.smith@nike.com", role: "VP Brand Experiences", status: "signed", signedAt: "2025-05-30" },
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

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: contractId } = use(params);
    // TODO: fetch contract by contractId from Supabase when hooks are wired
    void contractId;
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
        // TODO: wire to actual PDF generation endpoint
    };

    const handleSendForSignature = () => {
        addToast({
            title: "Signature Request Sent",
            description: `Signature request has been sent for ${contract.contractNumber}.`,
            variant: "success",
        });
        // TODO: wire to actual e-signature service
    };

    const daysUntilExpiry = useMemo(() => {
        const now = new Date();
        return Math.ceil((new Date(contract.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }, [contract.expirationDate]);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title={contract.title} description={`${contract.contractNumber} · ${typeCfg?.label}`}>
                <Link href="/contracts">
                    <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" />Export PDF</Button>
                <Button size="sm" onClick={handleSendForSignature}><Send className="mr-2 h-4 w-4" />Send for Signature</Button>
            </PageHeader>

            <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={statusCfg?.variant} className="text-sm px-3 py-1">{statusCfg?.label}</Badge>
                <Badge variant={typeCfg?.variant}>{typeCfg?.label}</Badge>
                {contract.autoRenew && <Badge variant="success">Auto-Renew</Badge>}
                {daysUntilExpiry <= 90 && daysUntilExpiry > 0 && (
                    <Badge variant="warning"><AlertTriangle className="mr-1 h-3 w-3" />{daysUntilExpiry}d until expiry</Badge>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Contract Value</p>
                                <p className="text-lg font-bold">{formatCurrency(contract.value)}</p>
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
                                <p className="text-xs text-muted-foreground">Effective Period</p>
                                <p className="text-sm font-semibold">{formatDate(contract.effectiveDate)} — {formatDate(contract.expirationDate)}</p>
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
                                <p className="text-xs text-muted-foreground">Counterparty</p>
                                <p className="text-sm font-semibold">{contract.clientName || contract.vendorName}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{contract.description}</p></CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />Key Clauses</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {contract.clauses.map((clause, i) => (
                            <div key={i} className="p-3 rounded-lg bg-secondary/30">
                                <h4 className="text-sm font-semibold">{clause.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{clause.summary}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><PenTool className="h-4 w-4" />Signatures</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {contract.signatures.map((sig, i) => {
                            const sigStatus = SIGNATURE_STATUSES.find(s => s.value === sig.status);
                            return (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <div>
                                        <p className="text-sm font-semibold">{sig.name}</p>
                                        <p className="text-xs text-muted-foreground">{sig.role} · {sig.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {sig.status === "signed" && sig.signedAt && (
                                            <span className="text-xs text-muted-foreground">Signed {formatDate(sig.signedAt)}</span>
                                        )}
                                        <Badge variant={sigStatus?.variant}>
                                            {sig.status === "signed" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                                            {sigStatus?.label}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {contract.amendments.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileSignature className="h-4 w-4" />Amendments</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {contract.amendments.map((amend) => (
                                <Link key={amend.id} href={`/contracts/${amend.id}`}>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                                        <div>
                                            <p className="text-sm font-semibold">{amend.title}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(amend.date)}</p>
                                        </div>
                                        <p className="text-sm font-bold">{formatCurrency(amend.value)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Related Documents</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {contract.relatedDocuments.map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">{doc.type} · Uploaded {formatDate(doc.uploadedAt)}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
