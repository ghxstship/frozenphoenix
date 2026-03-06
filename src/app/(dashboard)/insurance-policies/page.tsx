"use client";

import { useState } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_INSURANCE_POLICY_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Plus, Shield, XCircle } from "lucide-react";
import { MOCK_INSURANCE_POLICIES, MOCK_INSURANCE_REQUIREMENTS } from "@/lib/demo-data-governance";
import { useInsurancePolicies } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { InsurancePolicyStatus } from "@/types/governance";

const POLICY_STATUSES: InsurancePolicyStatus[] = [
    "draft",
    "pending_verification",
    "active",
    "expiring_soon",
    "expired",
    "cancelled",
    "suspended",
];

const POLICY_TYPE_LABELS: Record<string, string> = {
    general_liability: "General Liability",
    professional_liability: "Professional Liability",
    workers_compensation: "Workers Comp",
    auto_liability: "Auto Liability",
    equipment_floater: "Equipment Floater",
    event_liability: "Event Liability",
    umbrella: "Umbrella",
    property: "Property",
    cyber: "Cyber",
    directors_officers: "D&O",
    event_cancellation: "Event Cancellation",
    riggers_liability: "Rigger's Liability",
    pollution: "Pollution",
    other: "Other",
};

const holderNames: Record<string, string> = {
    v1: "SteelCraft Fabrication",
    v2: "EventTech Rentals",
    v3: "Lumina AV Solutions",
    "org-1": "Primary Organization",
};

export default function InsurancePoliciesPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: sbPolicies, isLoading } = useInsurancePolicies();

    const policies = (sbPolicies ?? []) as typeof MOCK_INSURANCE_POLICIES;

    const filtered = policies.filter((p) => {
        const holderName = holderNames[p.holder_id] || p.holder_id;
        const matchesSearch =
            !search ||
            holderName.toLowerCase().includes(search.toLowerCase()) ||
            p.carrier.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const active = policies.filter((p) => p.status === "active").length;
    const expiringSoon = policies.filter((p) => p.status === "expiring_soon").length;
    const expired = policies.filter((p) => p.status === "expired").length;
    const totalCoverage = policies
        .filter((p) => p.status === "active")
        .reduce((sum, p) => sum + p.coverage_amount, 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="insurance_policies" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Insurance Policies"
                    description="Unified insurance registry — verify coverage, track expiration, auto-suspend on lapse"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" /> Add Policy
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Active Policies" value={active} icon={CheckCircle2} />
                    <StatCard title="Expiring Soon" value={expiringSoon} icon={Clock} />
                    <StatCard title="Expired" value={expired} icon={XCircle} />
                    <StatCard
                        title="Total Coverage"
                        value={`$${(totalCoverage / 1000000).toFixed(1)}M`}
                        icon={Shield}
                    />
                </div>

                {(expired > 0 || expiringSoon > 0) && (
                    <Card className="border-destructive/30 bg-destructive/5">
                        <CardContent className="py-3 flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-destructive">
                                    Insurance Alerts
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {expired > 0 && `${expired} expired policy(ies). `}
                                    {expiringSoon > 0 &&
                                        `${expiringSoon} policy(ies) expiring within 30 days.`}
                                </p>
                            </div>
                            <Button size="sm" variant="destructive">
                                View Alerts
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search policies..."
                        className="flex-1 max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        {POLICY_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {getStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Policies ({filtered.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left p-3 font-medium">Holder</th>
                                        <th className="text-left p-3 font-medium">Type</th>
                                        <th className="text-left p-3 font-medium">
                                            Carrier / Policy #
                                        </th>
                                        <th className="text-left p-3 font-medium">Coverage</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Effective</th>
                                        <th className="text-left p-3 font-medium">Expiry</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                                        >
                                            <td className="p-3">
                                                <div className="font-medium">
                                                    {holderNames[p.holder_id] || p.holder_id}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {p.holder_type}
                                                </div>
                                            </td>
                                            <td className="p-3 text-xs">
                                                {POLICY_TYPE_LABELS[p.policy_type] || p.policy_type}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-xs font-medium">
                                                    {p.carrier}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {p.policy_number}
                                                </div>
                                            </td>
                                            <td className="p-3 text-xs font-medium">
                                                ${p.coverage_amount.toLocaleString()}
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge
                                                    status={p.status}
                                                    className="text-[10px]"
                                                />
                                            </td>
                                            <td className="p-3 text-xs">
                                                {new Date(p.effective_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-xs">
                                                {new Date(p.expiry_date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Insurance Requirements (
                            {MOCK_INSURANCE_REQUIREMENTS.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {MOCK_INSURANCE_REQUIREMENTS.map((req) => (
                                <div
                                    key={req.id}
                                    className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                                >
                                    <h4 className="text-sm font-medium mb-1">{req.name}</h4>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {req.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <span>Min: ${req.minimum_amount.toLocaleString()}</span>
                                        <span>·</span>
                                        <span>Before: {req.required_before}</span>
                                        {req.auto_suspend_on_expiry && (
                                            <span className="text-destructive">· Auto-suspend</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <CreateEntityDialog
                config={CREATE_INSURANCE_POLICY_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
