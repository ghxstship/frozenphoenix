"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { DEAL_STAGE_MAP } from "@/config/domain-config";
import type { DealStage } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDeals } from "@/lib/supabase/hooks";
import { PermissionGate } from "@/components/permission-guard";
import { ArrowRight, Building2, Calendar, DollarSign, Plus, TrendingUp, Upload, User } from "lucide-react";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import { CsvImportDialog } from "@/components/csv/csv-import-dialog";

interface DealListItem {
    id: string;
    title: string;
    company: string;
    value: number;
    stage: DealStage;
    probability: number;
    owner: string;
    expectedClose: string;
    lastActivity: string;
}

export default function DealsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [stageFilter, setStageFilter] = useState<string>("all");
    const [importOpen, setImportOpen] = useState(false);
    const { data: sbDeals, refetch } = useDeals();

    const handleImportComplete = useCallback(() => {
        void refetch();
    }, [refetch]);

    const deals: DealListItem[] = (sbDeals ?? []).map((d) => ({
        id: d.id,
        title: d.title,
        company: d.company ?? "",
        value: d.value ?? 0,
        stage: d.stage as DealStage,
        probability: d.probability ?? 0,
        owner: d.assigned_to ?? "",
        expectedClose: d.expected_close_date ?? "",
        lastActivity: d.updated_at ?? d.created_at ?? "",
    }));

    const filtered = deals.filter((d) => {
        const matchesSearch =
            d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStage = stageFilter === "all" || d.stage === stageFilter;
        return matchesSearch && matchesStage;
    });

    const totalPipeline = deals
        .filter((d) => d.stage !== "won" && d.stage !== "lost")
        .reduce((sum, d) => sum + d.value, 0);
    const weightedPipeline = deals
        .filter((d) => d.stage !== "won" && d.stage !== "lost")
        .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
    const wonValue = deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + d.value, 0);

    return (
        <PermissionGate resource="deals" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader title="Deals" description="Track and manage your sales pipeline">
                    <div className="flex items-center gap-2">
                        <CsvExportButton entity="deals" />
                        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                            <Upload className="h-4 w-4" />
                            Import CSV
                        </Button>
                        <Link href="/pipeline/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Deal
                            </Button>
                        </Link>
                    </div>
                </PageHeader>
                <CsvImportDialog
                    entity="deals"
                    open={importOpen}
                    onOpenChange={setImportOpen}
                    onImportComplete={handleImportComplete}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Pipeline"
                        value={formatCurrency(totalPipeline)}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Weighted Value"
                        value={formatCurrency(weightedPipeline)}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Won (YTD)"
                        value={formatCurrency(wonValue)}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Active Deals"
                        value={deals.filter((d) => d.stage !== "won" && d.stage !== "lost").length}
                        icon={Building2}
                    />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search deals..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {["all", "lead", "qualified", "proposal", "negotiation", "won", "lost"].map(
                            (s) => (
                                <Button
                                    key={s}
                                    variant={stageFilter === s ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStageFilter(s)}
                                >
                                    {s === "all"
                                        ? "All"
                                        : (DEAL_STAGE_MAP[s as DealStage]?.label ?? s)}
                                </Button>
                            )
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {filtered.map((deal, i) => {
                        const stageCfg = DEAL_STAGE_MAP[deal.stage];
                        return (
                            <Link href={`/deals/${deal.id}`} key={deal.id}>
                                <StaggerItem index={i} stagger="relaxed">
                                    <Card className="hover:shadow-md transition-all cursor-pointer">
                                        <CardContent className="py-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div
                                                        className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${deal.stage === "won" ? "bg-success/10" : deal.stage === "lost" ? "bg-destructive/10" : "bg-primary/10"}`}
                                                    >
                                                        <DollarSign
                                                            className={`h-5 w-5 ${deal.stage === "won" ? "text-success" : deal.stage === "lost" ? "text-destructive" : "text-primary"}`}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge variant={stageCfg?.variant}>
                                                                {stageCfg?.label}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {deal.probability}% probability
                                                            </span>
                                                        </div>
                                                        <h3 className="text-sm font-semibold mt-1">
                                                            {deal.title}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Building2 className="h-3 w-3" />
                                                                {deal.company}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {deal.owner}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Close:{" "}
                                                                {formatDate(deal.expectedClose)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-lg font-bold">
                                                        {formatCurrency(deal.value)}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Last activity:{" "}
                                                        {formatDate(deal.lastActivity)}
                                                    </p>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 ml-auto" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            </Link>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-1">No deals found</h3>
                            <p className="text-muted-foreground text-center">
                                Try adjusting your search or filters
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PermissionGate>
    );
}
