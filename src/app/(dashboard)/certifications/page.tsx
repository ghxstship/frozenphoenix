"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CERT_TYPE_LABELS, getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_CERTIFICATION_CONFIG } from "@/config/create-entity-configs";
import { BadgeCheck, CheckCircle2, Clock, Plus, XCircle } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import type { AssetCertification } from "@/types/governance";
import { useCertifications } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { AssetCertificationStatus } from "@/types/governance";

const CERT_STATUSES: AssetCertificationStatus[] = [
    "current",
    "expiring_soon",
    "expired",
    "pending_inspection",
    "failed",
];

export default function CertificationsPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: sbCerts, isLoading } = useCertifications();

    const certs = (sbCerts ?? []) as AssetCertification[];

    const filtered = certs.filter((c) => {
        const matchesSearch =
            !search ||
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.asset_id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const current = certs.filter((c) => c.status === "current").length;
    const expiringSoon = certs.filter((c) => c.status === "expiring_soon").length;
    const expired = certs.filter((c) => c.status === "expired" || c.status === "failed").length;

    if (isLoading) {
        return <LoadingState />;
    }

    return (
        <PermissionGate resource="certifications" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Certifications"
                    description="Unified crew and asset certification tracking with expiry enforcement"
                >
                    <div className="flex items-center gap-2">
                        <CsvExportButton entity="certifications" />
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="h-4 w-4" /> Add Certification
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Current" value={current} icon={CheckCircle2} />
                    <StatCard title="Expiring Soon" value={expiringSoon} icon={Clock} />
                    <StatCard title="Expired / Failed" value={expired} icon={XCircle} />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search certifications..."
                        className="flex-1 max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        {CERT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {getStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4" /> Asset Certifications (
                            {filtered.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left p-3 font-medium">Asset</th>
                                        <th className="text-left p-3 font-medium">Certification</th>
                                        <th className="text-left p-3 font-medium">Type</th>
                                        <th className="text-left p-3 font-medium">Issued By</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Issued</th>
                                        <th className="text-left p-3 font-medium">Expiry</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-0">
                                                <EmptyState
                                                    icon={BadgeCheck}
                                                    title="No certifications found"
                                                    description={
                                                        search || statusFilter !== "all"
                                                            ? "Try adjusting your search or filters"
                                                            : "Add your first certification"
                                                    }
                                                    action={
                                                        !search && statusFilter === "all"
                                                            ? {
                                                                  label: "Add Certification",
                                                                  onClick: openCreate,
                                                              }
                                                            : undefined
                                                    }
                                                    compact
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                                            >
                                                <td className="p-3 font-medium text-xs">
                                                    {c.asset_id}
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-xs font-medium">
                                                        {c.title}
                                                    </div>
                                                    {c.cert_number && (
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {c.cert_number}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-xs">
                                                    {CERT_TYPE_LABELS[c.cert_type] || c.cert_type}
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    {c.issued_by}
                                                </td>
                                                <td className="p-3">
                                                    <StatusBadge
                                                        status={c.status}
                                                        className="text-[10px]"
                                                    />
                                                </td>
                                                <td className="p-3 text-xs">
                                                    {new Date(c.issued_date).toLocaleDateString()}
                                                </td>
                                                <td className="p-3 text-xs">
                                                    {c.expiry_date
                                                        ? new Date(
                                                              c.expiry_date
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <CreateEntityDialog
                config={CREATE_CERTIFICATION_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
