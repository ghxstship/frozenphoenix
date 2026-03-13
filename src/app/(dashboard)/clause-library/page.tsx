"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_CLAUSE_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookLock, Plus } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import type { ClauseRiskLevel, ContractClause } from "@/types/governance";
import { useClauseLibrary } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

const CLAUSE_TYPE_LABELS: Record<string, string> = {
    indemnification: "Indemnification",
    limitation_of_liability: "Limitation of Liability",
    insurance_requirements: "Insurance Requirements",
    ip_ownership: "IP Ownership",
    ip_usage_rights: "IP Usage Rights",
    confidentiality: "Confidentiality",
    non_compete: "Non-Compete",
    force_majeure: "Force Majeure",
    termination: "Termination",
    payment_terms: "Payment Terms",
    dispute_resolution: "Dispute Resolution",
    data_privacy: "Data Privacy",
    cancellation: "Cancellation",
    weather_contingency: "Weather Contingency",
    warranty: "Warranty",
    other: "Other",
};

const RISK_VARIANTS: Record<ClauseRiskLevel, "success" | "info" | "warning" | "destructive"> = {
    low: "success",
    medium: "info",
    high: "warning",
    critical: "destructive",
};

export default function ClauseLibraryPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState<string>("all");

    const { data: sbClauses, isLoading } = useClauseLibrary();

    const clauses: ContractClause[] = (sbClauses ?? []).map(
        (c: Record<string, unknown>) =>
            ({
                id: (c.id as string) ?? "",
                clause_type: (c.clause_type as string) ?? "other",
                title: (c.title as string) ?? "",
                body: (c.body as string) ?? "",
                risk_level: ((c.risk_level as string) ?? "low") as ClauseRiskLevel,
                is_template: (c.is_template as boolean) ?? false,
                is_standard: (c.is_standard as boolean) ?? false,
                negotiable: (c.negotiable as boolean) ?? true,
            }) as ContractClause
    );

    if (isLoading) {
        return <LoadingState />;
    }

    const filtered = clauses.filter((c) => {
        const matchesSearch =
            !search ||
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.body.toLowerCase().includes(search.toLowerCase());
        const matchesRisk = riskFilter === "all" || c.risk_level === riskFilter;
        return matchesSearch && matchesRisk;
    });

    const templates = clauses.filter((c) => c.is_template).length;
    const highRisk = clauses.filter(
        (c) => c.risk_level === "high" || c.risk_level === "critical"
    ).length;

    return (
        <PermissionGate resource="clause_library" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Clause Library"
                    description="Standard contract clauses with risk classification — reuse across contracts to ensure consistency"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" /> Add Clause
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Total Clauses" value={clauses.length} icon={BookLock} />
                    <StatCard title="Templates" value={templates} icon={BookLock} />
                    <StatCard title="High/Critical Risk" value={highRisk} icon={BookLock} />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search clauses..."
                        className="flex-1 max-w-sm"
                    />
                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Risk Levels</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={BookLock}
                        title="No clauses found"
                        description={
                            search
                                ? "Try adjusting your search or filters"
                                : "Add your first clause to the library"
                        }
                        action={!search ? { label: "Add Clause", onClick: openCreate } : undefined}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filtered.map((c) => (
                            <Card
                                key={c.id}
                                className="hover:bg-muted/30 transition-colors cursor-pointer"
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-sm">{c.title}</CardTitle>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                {CLAUSE_TYPE_LABELS[c.clause_type] || c.clause_type}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Badge
                                                variant={RISK_VARIANTS[c.risk_level]}
                                                className="text-[9px]"
                                            >
                                                {c.risk_level}
                                            </Badge>
                                            {c.is_template && (
                                                <Badge variant="secondary" className="text-[9px]">
                                                    Template
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground line-clamp-3">
                                        {c.body}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
                                        {c.is_standard && <span>Standard</span>}
                                        {c.negotiable && <span>· Negotiable</span>}
                                        {!c.negotiable && (
                                            <span className="text-destructive">
                                                · Non-negotiable
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <CreateEntityDialog
                config={CREATE_CLAUSE_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
