"use client";

import React, { useMemo, useState } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_ACCOUNT_CONFIG } from "@/config/create-entity-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { OverlineText } from "@/components/ui/overline-text";
import { SearchInput } from "@/components/ui/search-input";
import type { AccountHealthScore } from "@/types/crm-revenue";
import { useAccounts } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import {
    AlertTriangle,
    Building2,
    ChevronRight,
    DollarSign,
    FileWarning,
    FolderKanban,
    HeartPulse,
    Loader2,
    Shield,
    Target,
} from "lucide-react";

function getRiskColor(risk: string): string {
    switch (risk) {
        case "low":
            return "text-success";
        case "medium":
            return "text-warning";
        case "high":
            return "text-destructive";
        case "critical":
            return "text-destructive";
        default:
            return "text-muted-foreground";
    }
}

function getScoreColor(score: number): string {
    if (score >= 80) return "bg-success/20 text-success";
    if (score >= 60) return "bg-warning/20 text-warning";
    if (score >= 40) return "bg-destructive/20 text-destructive";
    return "bg-destructive/20 text-destructive";
}

function ScoreBar({ label, score }: { label: string; score: number }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{score}</span>
            </div>
            <ProgressBar value={score} size="sm" />
        </div>
    );
}

export default function AccountsPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState<string>("all");
    const { data: sbAccounts, isLoading } = useAccounts();

    const accounts = useMemo(() => (sbAccounts ?? []) as AccountHealthScore[], [sbAccounts]);

    const filtered = useMemo(() => {
        let result = accounts;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((a) => (a.companyName ?? "").toLowerCase().includes(q));
        }
        if (riskFilter !== "all") result = result.filter((a) => a.riskLevel === riskFilter);
        return result;
    }, [accounts, search, riskFilter]);

    const stats = useMemo(() => {
        const totalRevenue = accounts.reduce((s, a) => s + a.lifetimeRevenue, 0);
        const avgHealth =
            accounts.length > 0
                ? Math.round(accounts.reduce((s, a) => s + a.overallScore, 0) / accounts.length)
                : 0;
        const atRisk = accounts.filter(
            (a) => a.riskLevel === "high" || a.riskLevel === "critical"
        ).length;
        const totalOpps = accounts.reduce((s, a) => s + a.openOpportunityCount, 0);
        return { totalRevenue, avgHealth, atRisk, totalOpps };
    }, [accounts]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="accounts" action="read">
            <div className="space-y-6">
                <PageHeader
                    title="Accounts"
                    description="Client relationship health and revenue overview"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Building2 className="mr-2 h-4 w-4" /> New Account
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Lifetime Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={DollarSign}
                    />
                    <StatCard title="Avg. Health Score" value={stats.avgHealth} icon={HeartPulse} />
                    <StatCard title="At-Risk Accounts" value={stats.atRisk} icon={AlertTriangle} />
                    <StatCard title="Open Opportunities" value={stats.totalOpps} icon={Target} />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search accounts..."
                        className="w-64"
                    />
                    <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                    >
                        <option value="all">All Risk Levels</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((account) => (
                        <AccountCard key={account.id} account={account} />
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-2 text-center py-12 text-muted-foreground">
                            No accounts match your filters
                        </div>
                    )}
                </div>
            </div>
            <CreateEntityDialog
                config={CREATE_ACCOUNT_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}

function AccountCard({ account }: { account: AccountHealthScore }) {
    return (
        <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{account.companyName}</CardTitle>
                            <div className="flex items-center gap-2 mt-0.5">
                                <StatusBadge status={account.riskLevel} />
                                <span className="text-xs text-muted-foreground">
                                    Score:{" "}
                                    <span
                                        className={`font-semibold ${getRiskColor(account.riskLevel)}`}
                                    >
                                        {account.overallScore}
                                    </span>
                                    /100
                                </span>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`text-xl font-bold rounded-lg px-3 py-1 ${getScoreColor(account.overallScore)}`}
                    >
                        {account.overallScore}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div>
                        <div className="text-lg font-semibold">
                            {account.lifetimeRevenue > 0
                                ? formatCurrency(account.lifetimeRevenue)
                                : "$0"}
                        </div>
                        <OverlineText>Revenue</OverlineText>
                    </div>
                    <div>
                        <div className="text-lg font-semibold flex items-center justify-center gap-1">
                            <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                            {account.activeProjectCount}
                        </div>
                        <OverlineText>Projects</OverlineText>
                    </div>
                    <div>
                        <div className="text-lg font-semibold flex items-center justify-center gap-1">
                            <Target className="h-3.5 w-3.5 text-muted-foreground" />
                            {account.openOpportunityCount}
                        </div>
                        <OverlineText>Opps</OverlineText>
                    </div>
                    <div>
                        <div className="text-lg font-semibold flex items-center justify-center gap-1">
                            {account.overdueInvoiceCount > 0 ? (
                                <FileWarning className="h-3.5 w-3.5 text-destructive" />
                            ) : (
                                <Shield className="h-3.5 w-3.5 text-success" />
                            )}
                            {account.overdueInvoiceCount}
                        </div>
                        <OverlineText>Overdue</OverlineText>
                    </div>
                </div>

                <div className="space-y-2">
                    <ScoreBar label="Delivery" score={account.deliveryScore} />
                    <ScoreBar label="Payment" score={account.paymentScore} />
                    <ScoreBar label="Engagement" score={account.engagementScore} />
                    <ScoreBar label="Satisfaction" score={account.satisfactionScore} />
                    <ScoreBar label="Expansion" score={account.expansionScore} />
                </div>

                {account.riskFactors.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">
                            Risk Factors
                        </div>
                        {account.riskFactors.map((rf, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                                <AlertTriangle
                                    className={`h-3 w-3 mt-0.5 flex-shrink-0 ${getRiskColor(rf.severity)}`}
                                />
                                <span>
                                    {rf.factor}
                                    {rf.detail ? ` — ${rf.detail}` : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {account.recommendations.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">
                            Recommendations
                        </div>
                        {account.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                                <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                                <span>
                                    {rec.action}
                                    {rec.detail ? ` — ${rec.detail}` : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {account.openOpportunityCount > 0 && (
                    <div className="space-y-1.5 border-t pt-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-muted-foreground">
                                Open Opportunities
                            </span>
                            <span className="font-semibold">{account.openOpportunityCount}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
