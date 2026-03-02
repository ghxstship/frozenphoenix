"use client";

import React from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured, useDeals } from "@/lib/supabase/hooks";
import { DEAL_STAGES, MOCK_DEALS } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    Calendar,
    Columns,
    DollarSign,
    GripVertical,
    List,
    Loader2,
    Plus,
    User,
} from "lucide-react";
import type { Deal, DealStage } from "@/types";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { CurrencyField, DateField, ProgressField } from "@/components/data-view/field-renderers";
import { DEAL_STAGE_MAP as DEAL_STAGE_CONFIG } from "@/config/domain-config";
import { PermissionGate } from "@/components/permission-guard";

type ViewMode = "board" | "table";

// ─── Table Columns Definition ───
const tableColumns: ColumnDef<Deal>[] = [
    {
        id: "title",
        header: "Deal",
        accessorKey: "title",
        sticky: true,
        minWidth: 200,
        render: (value, row) => (
            <div>
                <div className="font-medium">{String(value)}</div>
                <div className="text-xs text-muted-foreground">{row.company}</div>
            </div>
        ),
    },
    {
        id: "stage",
        header: "Stage",
        accessorKey: "stage",
        render: (value) => {
            const stage = DEAL_STAGES.find((s) => s.id === value);
            return (
                <Badge
                    variant={DEAL_STAGE_CONFIG[value as DealStage]?.variant ?? "secondary"}
                    className="text-xs"
                >
                    {stage?.label ?? String(value)}
                </Badge>
            );
        },
        width: 120,
    },
    {
        id: "value",
        header: "Value",
        accessorKey: "value",
        render: (value) => <CurrencyField value={value as number} />,
        width: 120,
        align: "right",
    },
    {
        id: "probability",
        header: "Probability",
        accessorKey: "probability",
        render: (value) => <ProgressField value={value as number} size="sm" />,
        width: 140,
    },
    {
        id: "contact",
        header: "Contact",
        accessorKey: "contactName",
        render: (value, row) => (
            <div>
                <div className="text-sm">{String(value)}</div>
                <div className="text-xs text-muted-foreground">{row.contactEmail}</div>
            </div>
        ),
        width: 180,
    },
    {
        id: "closeDate",
        header: "Expected Close",
        accessorKey: "expectedCloseDate",
        render: (value) => <DateField value={value as string} showOverdue />,
        width: 130,
    },
];

export default function PipelinePage() {
    const VIEW_MODES = ["board", "table"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "board",
        validValues: VIEW_MODES,
    });
    const { data: sbDeals, isLoading } = useDeals();

    const deals: Deal[] =
        isSupabaseConfigured && sbDeals
            ? sbDeals.map((d) => ({
                  id: d.id,
                  title: d.title,
                  company: d.company,
                  contactName: d.contact_name,
                  contactEmail: d.contact_email,
                  value: d.value,
                  stage: d.stage as DealStage,
                  probability: d.probability,
                  expectedCloseDate: d.expected_close_date,
                  assignedTo: d.assigned_to ?? "",
                  notes: d.notes ?? undefined,
                  createdAt: d.created_at ?? new Date().toISOString(),
                  updatedAt: d.updated_at ?? new Date().toISOString(),
              }))
            : MOCK_DEALS;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const stagesWithDeals = DEAL_STAGES.map((stage) => ({
        ...stage,
        deals: deals.filter((d) => d.stage === stage.id),
        total: deals.filter((d) => d.stage === stage.id).reduce((sum, d) => sum + d.value, 0),
    }));

    return (
        <PermissionGate resource="pipeline" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader title="Pipeline" description="Manage your sales pipeline and deal flow">
                    <div className="flex items-center gap-2">
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
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            New Deal
                        </Button>
                    </div>
                </PageHeader>

                {/* Pipeline Summary */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {stagesWithDeals
                        .filter((s) => s.id !== "lost")
                        .map((stage) => (
                            <div
                                key={stage.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-xs whitespace-nowrap"
                            >
                                <span className="font-medium">{stage.label}</span>
                                <span className="font-bold text-primary">
                                    {formatCurrency(stage.total)}
                                </span>
                                <Badge variant="ghost" className="text-[10px] px-1">
                                    {stage.deals.length}
                                </Badge>
                            </div>
                        ))}
                </div>

                {/* Table View */}
                {viewMode === "table" && (
                    <DataTable
                        data={deals}
                        columns={tableColumns}
                        keyField="id"
                        sortable
                        searchable
                        searchPlaceholder="Search deals..."
                        pagination
                        pageSize={15}
                        hoverable
                        stickyHeader
                    />
                )}

                {/* Kanban Board */}
                {viewMode === "board" && (
                    <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 min-h-[calc(100vh-240px)]">
                        {stagesWithDeals.map((stage) => (
                            <div
                                key={stage.id}
                                className="flex-shrink-0 w-64 sm:w-72 flex flex-col"
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-3 py-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: stage.color }}
                                        />
                                        <span className="text-sm font-semibold">{stage.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ({stage.deals.length})
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {formatCurrency(stage.total)}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="flex-1 space-y-2">
                                    {stage.deals.map((deal, i) => (
                                        <StaggerItem key={deal.id} index={i} stagger="relaxed">
                                            <div className="spatial-card p-4 cursor-grab active:cursor-grabbing">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold truncate">
                                                            {deal.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {deal.company}
                                                        </p>
                                                    </div>
                                                    <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                                                </div>

                                                <div className="flex items-center gap-1.5 mb-3">
                                                    <DollarSign className="h-3.5 w-3.5 text-success" />
                                                    <span className="text-sm font-bold">
                                                        {formatCurrency(deal.value)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                        <User className="h-3 w-3" />
                                                        <span>{deal.contactName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {formatDate(
                                                                deal.expectedCloseDate,
                                                                "compact"
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Probability bar */}
                                                <div className="mt-3 flex items-center gap-2">
                                                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${deal.probability}%`,
                                                                backgroundColor: stage.color,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-medium text-muted-foreground">
                                                        {deal.probability}%
                                                    </span>
                                                </div>
                                            </div>
                                        </StaggerItem>
                                    ))}

                                    {/* Empty state */}
                                    {stage.deals.length === 0 && (
                                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                                            <p className="text-xs text-muted-foreground">
                                                No deals in this stage
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PermissionGate>
    );
}
