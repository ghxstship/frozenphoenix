"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React, { useMemo, useState } from "react";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_OPPORTUNITY_CONFIG } from "@/config/create-entity-configs";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { CurrencyField, DateField } from "@/components/data-view/field-renderers";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import {
    OPPORTUNITY_STAGES_KANBAN as OPPORTUNITY_STAGES,
    OPPORTUNITY_TYPE_MAP,
} from "@/config/domain-config";
import { useOpportunities } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { Opportunity, OpportunityStage } from "@/types";
import {
    Building2,
    Calendar,
    Clock,
    Columns,
    DollarSign,
    GripVertical,
    List,
    Plus,
    Target,
    TrendingUp,
    User,
} from "lucide-react";

type ViewMode = "board" | "table";

const ACTIVE_STAGES: OpportunityStage[] = [
    "discovery",
    "qualification",
    "proposal_sent",
    "proposal_review",
    "negotiation",
    "contract_sent",
];

const tableColumns: ColumnDef<Opportunity>[] = [
    {
        id: "name",
        header: "Opportunity",
        accessorKey: "name",
        sticky: true,
        minWidth: 220,
        render: (value, row) => (
            <div>
                <div className="font-medium">{String(value)}</div>
                <div className="text-xs text-muted-foreground">{row.companyName}</div>
            </div>
        ),
    },
    {
        id: "type",
        header: "Type",
        accessorKey: "type",
        minWidth: 120,
        render: (value) => {
            const config = OPPORTUNITY_TYPE_MAP[value as keyof typeof OPPORTUNITY_TYPE_MAP];
            return config ? <Badge variant="outline">{config.label}</Badge> : String(value);
        },
    },
    {
        id: "stage",
        header: "Stage",
        accessorKey: "stage",
        minWidth: 140,
        render: (value) => <StatusBadge status={String(value)} />,
    },
    {
        id: "value",
        header: "Value",
        accessorKey: "value",
        minWidth: 120,
        align: "right",
        render: (value) => <CurrencyField value={Number(value)} />,
    },
    {
        id: "weightedValue",
        header: "Weighted",
        accessorKey: "weightedValue",
        minWidth: 120,
        align: "right",
        render: (value) => <CurrencyField value={Number(value)} />,
    },
    {
        id: "probability",
        header: "Prob.",
        accessorKey: "probability",
        minWidth: 80,
        align: "right",
        render: (value) => <span className="text-muted-foreground">{Number(value)}%</span>,
    },
    {
        id: "expectedCloseDate",
        header: "Expected Close",
        accessorKey: "expectedCloseDate",
        minWidth: 130,
        render: (value) => <DateField value={String(value)} />,
    },
    {
        id: "assignedToName",
        header: "Owner",
        accessorKey: "assignedToName",
        minWidth: 130,
    },
    {
        id: "nextStep",
        header: "Next Step",
        accessorKey: "nextStep",
        minWidth: 200,
        render: (value) => (
            <span className="text-xs text-muted-foreground line-clamp-2">
                {String(value ?? "")}
            </span>
        ),
    },
];

export default function OpportunitiesPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const VIEW_MODES = ["board", "table"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "board",
        validValues: VIEW_MODES,
    });
    const [search, setSearch] = useState("");
    const [stageFilter, setStageFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const { data: sbOpps, isLoading } = useOpportunities();

    const opportunities = useMemo(() => (sbOpps ?? []) as unknown as Opportunity[], [sbOpps]);

    const filtered = useMemo(() => {
        let result = opportunities;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (o) =>
                    o.name.toLowerCase().includes(q) ||
                    (o.companyName ?? "").toLowerCase().includes(q) ||
                    (o.contactName ?? "").toLowerCase().includes(q)
            );
        }
        if (stageFilter !== "all") result = result.filter((o) => o.stage === stageFilter);
        if (typeFilter !== "all") result = result.filter((o) => o.type === typeFilter);
        return result;
    }, [opportunities, search, stageFilter, typeFilter]);

    const stats = useMemo(() => {
        const active = opportunities.filter((o) => ACTIVE_STAGES.includes(o.stage));
        return {
            totalPipeline: active.reduce((s, o) => s + o.value, 0),
            weightedPipeline: active.reduce((s, o) => s + o.weightedValue, 0),
            activeCount: active.length,
            avgProbability:
                active.length > 0
                    ? Math.round(active.reduce((s, o) => s + o.probability, 0) / active.length)
                    : 0,
        };
    }, [opportunities]);

    const boardStages = OPPORTUNITY_STAGES.filter((s) => s.id !== "won" && s.id !== "lost");

    if (isLoading) {
        return <LoadingState />;
    }

    return (
        <PermissionGate resource="opportunities" action="read">
            <div className="space-y-6">
                <PageHeader
                    title="Opportunities"
                    description="Sales pipeline — track opportunities from discovery to close"
                >
                    <div className="flex items-center gap-2">
                        <CsvExportButton entity="opportunities" />
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" /> New Opportunity
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Pipeline Value"
                        value={formatCurrency(stats.totalPipeline)}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Weighted Value"
                        value={formatCurrency(stats.weightedPipeline)}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Active Opportunities"
                        value={stats.activeCount}
                        icon={Target}
                    />
                    <StatCard
                        title="Avg. Probability"
                        value={`${stats.avgProbability}%`}
                        icon={Clock}
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        <SearchInput
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Search opportunities..."
                        />
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={stageFilter}
                            onChange={(e) => setStageFilter(e.target.value)}
                        >
                            <option value="all">All Stages</option>
                            {OPPORTUNITY_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="new_business">New Business</option>
                            <option value="expansion">Expansion</option>
                            <option value="renewal">Renewal</option>
                            <option value="upsell">Upsell</option>
                        </select>
                    </div>
                    <SegmentedControl
                        value={viewMode}
                        onValueChange={(v) => setViewMode(v as ViewMode)}
                        options={[
                            {
                                value: "board",
                                label: "Board",
                                icon: <Columns className="h-4 w-4" />,
                                labelHidden: true,
                            },
                            {
                                value: "table",
                                label: "Table",
                                icon: <List className="h-4 w-4" />,
                                labelHidden: true,
                            },
                        ]}
                        ariaLabel="View mode"
                    />
                </div>

                {viewMode === "table" ? (
                    <DataTable
                        columns={tableColumns}
                        data={filtered}
                        keyField="id"
                        emptyState={
                            <div className="text-center py-8 text-muted-foreground">
                                No opportunities found
                            </div>
                        }
                    />
                ) : (
                    <div className="flex gap-3 overflow-x-auto pb-4">
                        {boardStages.map((stage) => {
                            const stageOpps = filtered.filter((o) => o.stage === stage.id);
                            const stageTotal = stageOpps.reduce((s, o) => s + o.value, 0);
                            return (
                                <div
                                    key={stage.id}
                                    className="flex-shrink-0 w-72 bg-muted/50 rounded-lg p-3 space-y-2"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: stage.color }}
                                            />
                                            <span className="text-sm font-medium">
                                                {stage.label}
                                            </span>
                                            <Badge variant="secondary" className="text-xs">
                                                {stageOpps.length}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatCurrency(stageTotal)}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {stageOpps.map((opp) => (
                                            <div
                                                key={opp.id}
                                                className="bg-background rounded-lg border p-3 space-y-2 cursor-grab hover:shadow-sm transition-shadow"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                                                        <span className="font-medium text-sm leading-tight">
                                                            {opp.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Building2 className="h-3 w-3" />
                                                    <span>{opp.companyName}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <DollarSign className="h-3 w-3" />
                                                        <span className="font-medium text-foreground">
                                                            {formatCurrency(opp.value)}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            ({opp.probability}%)
                                                        </span>
                                                    </div>
                                                </div>
                                                {opp.type !== "new_business" && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] px-1.5 py-0"
                                                    >
                                                        {OPPORTUNITY_TYPE_MAP[opp.type]?.label ??
                                                            opp.type}
                                                    </Badge>
                                                )}
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {opp.expectedCloseDate
                                                                ? formatDate(
                                                                      opp.expectedCloseDate,
                                                                      "compact"
                                                                  )
                                                                : "TBD"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>
                                                            {opp.assignedToName?.split(" ")[0] ??
                                                                "Unassigned"}
                                                        </span>
                                                    </div>
                                                </div>
                                                {opp.nextStep && (
                                                    <p className="text-[10px] text-muted-foreground line-clamp-2 border-t pt-1.5 mt-1">
                                                        {opp.nextStep}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                        {stageOpps.length === 0 && (
                                            <div className="text-xs text-muted-foreground text-center py-4">
                                                No opportunities
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <CreateEntityDialog
                config={CREATE_OPPORTUNITY_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
