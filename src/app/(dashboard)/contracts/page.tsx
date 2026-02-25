"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { CONTRACT_STATUS_MAP, CONTRACT_TYPE_MAP, type ContractStatusType, type ContractType } from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    FileSignature, Plus, Search, Calendar, Building2, AlertTriangle,
    CheckCircle2, Clock, DollarSign,
} from "lucide-react";

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

const mockContracts: ContractListItem[] = [
    { id: "1", title: "Nike Master Services Agreement", contractNumber: "CTR-2026-0001", type: "msa", status: "active", clientName: "Nike", value: 2500000, effectiveDate: "2025-06-01", expirationDate: "2027-05-31", autoRenew: true, daysUntilExpiry: 460 },
    { id: "2", title: "AV Vendor Services — Pulse Productions", contractNumber: "CTR-2026-0002", type: "vendor", status: "active", vendorName: "Pulse Productions", value: 185000, effectiveDate: "2026-01-15", expirationDate: "2026-12-31", autoRenew: false, daysUntilExpiry: 309 },
    { id: "3", title: "Red Bull NDA", contractNumber: "CTR-2026-0003", type: "nda", status: "active", clientName: "Red Bull", value: 0, effectiveDate: "2026-02-01", expirationDate: "2028-01-31", autoRenew: false, daysUntilExpiry: 705 },
    { id: "4", title: "Coachella SOW — Stage Design", contractNumber: "CTR-2026-0004", type: "sow", status: "pending_signature", clientName: "Coachella Valley Music", value: 750000, effectiveDate: "2026-03-01", expirationDate: "2026-06-30", autoRenew: false, daysUntilExpiry: 125 },
    { id: "5", title: "Fabrication Vendor — SteelCraft", contractNumber: "CTR-2026-0005", type: "vendor", status: "expired", vendorName: "SteelCraft Industries", value: 95000, effectiveDate: "2025-01-01", expirationDate: "2025-12-31", autoRenew: false, daysUntilExpiry: -56 },
    { id: "6", title: "Amendment #1 — Nike Scope Extension", contractNumber: "CTR-2026-0006", type: "amendment", status: "pending_review", clientName: "Nike", value: 350000, effectiveDate: "2026-04-01", expirationDate: "2027-05-31", autoRenew: false, daysUntilExpiry: 460 },
    { id: "7", title: "Client Agreement — TechStart Launch", contractNumber: "CTR-2026-0007", type: "client", status: "draft", clientName: "TechStart Inc", value: 125000, effectiveDate: "2026-03-15", expirationDate: "2026-09-15", autoRenew: false, daysUntilExpiry: 202 },
];

export default function ContractsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const filtered = mockContracts.filter((c) => {
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
        total: mockContracts.length,
        active: mockContracts.filter((c) => c.status === "active").length,
        pendingSignature: mockContracts.filter((c) => c.status === "pending_signature" || c.status === "pending_review").length,
        expiringSoon: mockContracts.filter((c) => c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 90).length,
        totalValue: mockContracts.filter((c) => c.status === "active").reduce((sum, c) => sum + c.value, 0),
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Contract Management" description="Track contracts, NDAs, SOWs, and amendments across all projects">
                <Link href="/contracts/new">
                    <Button><Plus className="mr-2 h-4 w-4" />New Contract</Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Contracts" value={stats.total} icon={FileSignature} />
                <StatCard title="Active" value={stats.active} icon={CheckCircle2} />
                <StatCard title="Pending Action" value={stats.pendingSignature} icon={Clock} />
                <StatCard title="Active Value" value={formatCurrency(stats.totalValue)} icon={DollarSign} />
            </div>

            {stats.expiringSoon > 0 && (
                <Card className="border-warning/30 bg-warning/5">
                    <CardContent className="py-3">
                        <div className="flex items-center gap-2 text-warning text-sm font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            {stats.expiringSoon} contract{stats.expiringSoon > 1 ? "s" : ""} expiring within 90 days
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search contracts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["all", "active", "pending_review", "pending_signature", "draft", "expired"].map((s) => (
                        <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
                            {s === "all" ? "All" : CONTRACT_STATUS_MAP[s as ContractStatusType]?.label ?? s}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 flex-wrap">
                {["all", "client", "vendor", "nda", "msa", "sow", "amendment"].map((t) => (
                    <Button key={t} variant={typeFilter === t ? "secondary" : "ghost"} size="sm" onClick={() => setTypeFilter(t)}>
                        {t === "all" ? "All Types" : CONTRACT_TYPE_MAP[t as ContractType]?.label ?? t}
                    </Button>
                ))}
            </div>

            <div className="space-y-3">
                {filtered.map((contract, i) => {
                    const statusCfg = CONTRACT_STATUS_MAP[contract.status];
                    const typeCfg = CONTRACT_TYPE_MAP[contract.type];
                    const isExpiring = contract.daysUntilExpiry > 0 && contract.daysUntilExpiry <= 90;

                    return (
                        <Link key={contract.id} href={`/contracts/${contract.id}`}>
                            <Card
                                className={`cursor-pointer hover:shadow-md transition-all animate-slide-up ${isExpiring ? "border-warning/30" : ""}`}
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <FileSignature className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono text-muted-foreground">{contract.contractNumber}</span>
                                                    <Badge variant={typeCfg?.variant}>{typeCfg?.label}</Badge>
                                                    <Badge variant={statusCfg?.variant}>{statusCfg?.label}</Badge>
                                                </div>
                                                <h3 className="text-sm font-semibold mt-1 truncate">{contract.title}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                    {(contract.clientName || contract.vendorName) && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            {contract.clientName || contract.vendorName}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(contract.effectiveDate)} — {formatDate(contract.expirationDate)}
                                                    </span>
                                                    {contract.autoRenew && (
                                                        <span className="text-success font-medium">Auto-renew</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            {contract.value > 0 && (
                                                <p className="text-sm font-bold">{formatCurrency(contract.value)}</p>
                                            )}
                                            {isExpiring && (
                                                <p className="text-xs text-warning font-medium mt-1">
                                                    {contract.daysUntilExpiry}d until expiry
                                                </p>
                                            )}
                                            {contract.daysUntilExpiry < 0 && (
                                                <p className="text-xs text-destructive font-medium mt-1">
                                                    Expired {Math.abs(contract.daysUntilExpiry)}d ago
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileSignature className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No contracts found</h3>
                        <p className="text-muted-foreground text-center">
                            {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "Create your first contract to get started"}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
