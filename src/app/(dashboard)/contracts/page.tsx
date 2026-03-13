"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import Link from "next/link";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_CONTRACT_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
    CONTRACT_STATUS_MAP,
    CONTRACT_TYPE_MAP,
    type ContractStatusType,
    type ContractType,
} from "@/config/domain-config";
import { useContracts } from "@/lib/supabase/hooks";
import { PermissionGate } from "@/components/permission-guard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    AlertTriangle,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    FileSignature,
    Plus,
} from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";

interface ContractListItem {
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
    daysUntilExpiry: number;
}

export default function ContractsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const { data: sbContracts, isLoading } = useContracts();

    const now = new Date();
    const contracts: ContractListItem[] = (sbContracts ?? []).map((c) => {
        const raw = c as unknown as Record<string, unknown>;
        const contractNumber = String(raw.contract_number || "");
        const effectiveDate = String(raw.effective_date || "");
        const expirationDate = String(raw.expiration_date || "");
        return {
            id: c.id,
            title: String(raw.title || contractNumber || "Untitled"),
            contractNumber,
            type: String(raw.type || "msa") as ContractType,
            status: String(raw.status || "draft") as ContractStatusType,
            vendorName: (c as unknown as { vendors?: { name: string } }).vendors?.name || undefined,
            clientName: undefined,
            value: Number(raw.value || 0),
            effectiveDate,
            expirationDate,
            autoRenew: Boolean(raw.auto_renew),
            daysUntilExpiry: Math.ceil(
                (new Date(expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            ),
        };
    });

    if (isLoading) {
        return <LoadingState />;
    }

    const filtered = contracts.filter((c) => {
        const matchesSearch =
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (c.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        const matchesType = typeFilter === "all" || c.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = {
        total: contracts.length,
        active: contracts.filter((c) => c.status === "active").length,
        pendingSignature: contracts.filter(
            (c) => c.status === "pending_signature" || c.status === "pending_review"
        ).length,
        expiringSoon: contracts.filter((c) => c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 90)
            .length,
        totalValue: contracts
            .filter((c) => c.status === "active")
            .reduce((sum, c) => sum + c.value, 0),
    };

    return (
        <>
            <PermissionGate resource="contracts" action="read">
                <div className="space-y-6 animate-fade-in">
                    <PageHeader
                        title="Contract Management"
                        description="Track contracts, NDAs, SOWs, and amendments across all projects"
                    >
                        <div className="flex items-center gap-2">
                            <CsvExportButton entity="contracts" />
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Contract
                            </Button>
                        </div>
                    </PageHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Contracts"
                            value={stats.total}
                            icon={FileSignature}
                        />
                        <StatCard title="Active" value={stats.active} icon={CheckCircle2} />
                        <StatCard
                            title="Pending Action"
                            value={stats.pendingSignature}
                            icon={Clock}
                        />
                        <StatCard
                            title="Active Value"
                            value={formatCurrency(stats.totalValue)}
                            icon={DollarSign}
                        />
                    </div>

                    {stats.expiringSoon > 0 && (
                        <Card className="border-warning/30 bg-warning/5">
                            <CardContent className="py-3">
                                <div className="flex items-center gap-2 text-warning text-sm font-medium">
                                    <AlertTriangle className="h-4 w-4" />
                                    {stats.expiringSoon} contract{stats.expiringSoon > 1 ? "s" : ""}{" "}
                                    expiring within 90 days
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <SearchInput
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            placeholder="Search contracts..."
                            className="flex-1 max-w-sm"
                        />
                        <div className="flex gap-2 flex-wrap">
                            {[
                                "all",
                                "active",
                                "pending_review",
                                "pending_signature",
                                "draft",
                                "expired",
                            ].map((s) => (
                                <Button
                                    key={s}
                                    variant={statusFilter === s ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter(s)}
                                >
                                    {s === "all"
                                        ? "All"
                                        : (CONTRACT_STATUS_MAP[s as ContractStatusType]?.label ??
                                          s)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {["all", "client", "vendor", "nda", "msa", "sow", "amendment"].map((t) => (
                            <Button
                                key={t}
                                variant={typeFilter === t ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setTypeFilter(t)}
                            >
                                {t === "all"
                                    ? "All Types"
                                    : (CONTRACT_TYPE_MAP[t as ContractType]?.label ?? t)}
                            </Button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={FileSignature}
                            title="No contracts found"
                            description={
                                searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "Create your first contract to get started"
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((contract, i) => {
                                const statusCfg = CONTRACT_STATUS_MAP[contract.status];
                                const typeCfg = CONTRACT_TYPE_MAP[contract.type];
                                const isExpiring =
                                    contract.daysUntilExpiry > 0 && contract.daysUntilExpiry <= 90;

                                return (
                                    <StaggerItem key={contract.id} index={i} stagger="relaxed">
                                        <Link href={`/contracts/${contract.id}`}>
                                            <Card
                                                className={`cursor-pointer hover:shadow-md transition-all ${isExpiring ? "border-warning/30" : ""}`}
                                            >
                                                <CardContent className="py-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                                <FileSignature className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-xs font-mono text-muted-foreground">
                                                                        {contract.contractNumber}
                                                                    </span>
                                                                    <Badge
                                                                        variant={typeCfg?.variant}
                                                                    >
                                                                        {typeCfg?.label}
                                                                    </Badge>
                                                                    <Badge
                                                                        variant={statusCfg?.variant}
                                                                    >
                                                                        {statusCfg?.label}
                                                                    </Badge>
                                                                </div>
                                                                <h3 className="text-sm font-semibold mt-1 truncate">
                                                                    {contract.title}
                                                                </h3>
                                                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                                    {(contract.clientName ||
                                                                        contract.vendorName) && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Building2 className="h-3 w-3" />
                                                                            {contract.clientName ||
                                                                                contract.vendorName}
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {formatDate(
                                                                            contract.effectiveDate
                                                                        )}{" "}
                                                                        —{" "}
                                                                        {formatDate(
                                                                            contract.expirationDate
                                                                        )}
                                                                    </span>
                                                                    {contract.autoRenew && (
                                                                        <span className="text-success font-medium">
                                                                            Auto-renew
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            {contract.value > 0 && (
                                                                <p className="text-sm font-bold">
                                                                    {formatCurrency(contract.value)}
                                                                </p>
                                                            )}
                                                            {isExpiring && (
                                                                <p className="text-xs text-warning font-medium mt-1">
                                                                    {contract.daysUntilExpiry}d
                                                                    until expiry
                                                                </p>
                                                            )}
                                                            {contract.daysUntilExpiry < 0 && (
                                                                <p className="text-xs text-destructive font-medium mt-1">
                                                                    Expired{" "}
                                                                    {Math.abs(
                                                                        contract.daysUntilExpiry
                                                                    )}
                                                                    d ago
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </StaggerItem>
                                );
                            })}
                        </div>
                    )}
                </div>
            </PermissionGate>
            <CreateEntityDialog
                config={CREATE_CONTRACT_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </>
    );
}
