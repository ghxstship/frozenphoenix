"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import {
    ShieldCheck, ShieldAlert, FileText, AlertTriangle,
    CheckCircle2, Clock, XCircle, RefreshCw, Loader2,
} from "lucide-react";
import { MOCK_VENDOR_COMPLIANCE_DOCS, MOCK_COMPLIANCE_REQUIREMENTS } from "@/lib/demo-data-vendor-lifecycle";
import { useVendorComplianceDocs, isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { ComplianceDocStatus, VendorComplianceDoc } from "@/types/vendor-lifecycle";

const COMPLIANCE_STATUSES: ComplianceDocStatus[] = ["not_submitted", "pending_review", "approved", "rejected", "expired", "expiring_soon"];

const DOC_TYPE_LABELS: Record<string, string> = {
    coi: "Certificate of Insurance",
    w9: "W-9 Tax Form",
    w8ben: "W-8BEN",
    nda: "Non-Disclosure Agreement",
    msa: "Master Service Agreement",
    business_license: "Business License",
    workers_comp: "Workers Compensation",
    auto_insurance: "Auto Insurance",
    professional_license: "Professional License",
    union_card: "Union Card",
    background_check: "Background Check",
    drug_test: "Drug Test",
    safety_cert: "Safety Certification",
    equipment_cert: "Equipment Certification",
    diversity_cert: "Diversity Certification",
    tax_exempt: "Tax Exempt Certificate",
    bank_info: "Banking Information",
    other: "Other",
};

const vendorNames: Record<string, string> = {
    v1: "SteelCraft Fabrication",
    v2: "EventTech Rentals",
    v3: "Lumina AV Solutions",
    v4: "ProStage Lighting",
    v5: "SoundWave Audio",
};

export default function VendorCompliancePage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbDocs, isLoading } = useVendorComplianceDocs();

    const docs: VendorComplianceDoc[] = isSupabaseConfigured && sbDocs
        ? sbDocs.map((d: Record<string, unknown>) => ({
            id: (d.id as string) ?? "",
            vendorId: (d.vendor_id as string) ?? "",
            docType: (d.doc_type as string) ?? "other",
            docName: (d.doc_name as string) ?? "",
            status: ((d.status as string) ?? "not_submitted") as ComplianceDocStatus,
            expiryDate: (d.expiry_date as string) ?? undefined,
            submittedAt: (d.submitted_at as string) ?? "",
            coverageAmount: (d.coverage_amount as number) ?? undefined,
            carrierName: (d.carrier_name as string) ?? undefined,
        } as VendorComplianceDoc))
        : MOCK_VENDOR_COMPLIANCE_DOCS;
    const requirements = MOCK_COMPLIANCE_REQUIREMENTS;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = docs.filter(doc => {
        const vendorName = vendorNames[doc.vendorId] || doc.vendorId;
        const matchesSearch = !search || vendorName.toLowerCase().includes(search.toLowerCase()) || doc.docName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const approved = docs.filter(d => d.status === "approved").length;
    const expired = docs.filter(d => d.status === "expired").length;
    const expiringSoon = docs.filter(d => d.status === "expiring_soon").length;
    const pendingReview = docs.filter(d => d.status === "pending_review").length;

    const daysUntilExpiry = (dateStr?: string) => {
        if (!dateStr) return null;
        const today = new Date("2026-02-25");
        const diff = new Date(dateStr).getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <PermissionGate resource="vendor_compliance" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Vendor Compliance" description="Document tracking, verification status, and compliance requirement management for all vendors">
                <Button size="sm"><RefreshCw className="h-4 w-4" /> Sync Status</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Approved Docs" value={approved} icon={CheckCircle2} />
                <StatCard title="Pending Review" value={pendingReview} icon={Clock} />
                <StatCard title="Expiring Soon" value={expiringSoon} icon={AlertTriangle} />
                <StatCard title="Expired" value={expired} icon={XCircle} />
            </div>

            {(expired > 0 || expiringSoon > 0) && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="py-3 flex items-center gap-3">
                        <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-destructive">Compliance Alerts</p>
                            <p className="text-xs text-muted-foreground">
                                {expired > 0 && `${expired} expired document(s). `}
                                {expiringSoon > 0 && `${expiringSoon} document(s) expiring within 30 days.`}
                            </p>
                        </div>
                        <Button size="sm" variant="destructive">View Alerts</Button>
                    </CardContent>
                </Card>
            )}

            <div className="flex items-center gap-3">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search vendors or documents..." className="flex-1 max-w-sm" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">All Statuses</option>
                    {COMPLIANCE_STATUSES.map((s) => (
                        <option key={s} value={s}>{getStatusLabel(s)}</option>
                    ))}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Compliance Documents ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left p-3 font-medium">Vendor</th>
                                    <th className="text-left p-3 font-medium">Document</th>
                                    <th className="text-left p-3 font-medium">Type</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Expiry</th>
                                    <th className="text-left p-3 font-medium">Coverage</th>
                                    <th className="text-left p-3 font-medium">Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(doc => {
                                    const days = daysUntilExpiry(doc.expiryDate);
                                    return (
                                        <tr key={doc.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                                            <td className="p-3 font-medium">{vendorNames[doc.vendorId] || doc.vendorId}</td>
                                            <td className="p-3">{doc.docName}</td>
                                            <td className="p-3 text-xs text-muted-foreground">{DOC_TYPE_LABELS[doc.docType] || doc.docType}</td>
                                            <td className="p-3">
                                                <StatusBadge status={doc.status} className="text-[10px]" />
                                            </td>
                                            <td className="p-3">
                                                {doc.expiryDate ? (
                                                    <div className="text-xs">
                                                        <span>{new Date(doc.expiryDate).toLocaleDateString()}</span>
                                                        {days !== null && days <= 30 && days > 0 && (
                                                            <span className="text-warning ml-1">({days}d)</span>
                                                        )}
                                                        {days !== null && days <= 0 && (
                                                            <span className="text-destructive ml-1">(Expired)</span>
                                                        )}
                                                    </div>
                                                ) : <span className="text-xs text-muted-foreground">N/A</span>}
                                            </td>
                                            <td className="p-3 text-xs">
                                                {doc.coverageAmount ? `$${doc.coverageAmount.toLocaleString()}` : "—"}
                                                {doc.carrierName && <span className="text-muted-foreground ml-1">({doc.carrierName})</span>}
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">
                                                {new Date(doc.submittedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Compliance Requirements ({requirements.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {requirements.map(req => (
                            <div key={req.id} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className="text-sm font-medium">{req.name}</h4>
                                    {req.isRequired && <Badge variant="destructive" className="text-[9px]">Required</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{req.description}</p>
                                <div className="flex flex-wrap gap-1">
                                    {req.appliesToVendorTypes.map(vt => (
                                        <span key={vt} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{vt.replace("_", " ")}</span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                                    {req.hasExpiry && <span>Expires · {req.expiryWarningDays}d warning</span>}
                                    {req.autoSuspendOnExpiry && <span className="text-destructive">Auto-suspend</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
        </PermissionGate>
    );
}
