"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_ESTIMATE_CONFIG } from "@/config/create-entity-configs";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    FileSignature,
    LayoutGrid,
    Plus,
    Send,
    Table2,
} from "lucide-react";
import type { Estimate } from "@/types/vendor-lifecycle";
import { useEstimates } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import { Loader2 } from "lucide-react";
import type { EstimateStatus } from "@/types/vendor-lifecycle";
import { SegmentedControl } from "@/components/ui/segmented-control";

type ViewMode = "cards" | "table";

const ESTIMATE_STATUSES: EstimateStatus[] = [
    "draft",
    "sent",
    "viewed",
    "accepted",
    "rejected",
    "expired",
    "converted",
];

export default function EstimatesPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const VIEW_MODES = ["cards", "table"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "cards",
        validValues: VIEW_MODES,
    });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: sbEstimates, isLoading } = useEstimates();

    const estimates = (sbEstimates ?? []) as Estimate[];
    const filtered = estimates.filter((est) => {
        const matchesSearch =
            !search ||
            est.title.toLowerCase().includes(search.toLowerCase()) ||
            est.number.toLowerCase().includes(search.toLowerCase()) ||
            (est.companyName || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || est.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalValue = estimates.reduce((s, e) => s + e.total, 0);
    const acceptedValue = estimates
        .filter((e) => e.status === "accepted")
        .reduce((s, e) => s + e.total, 0);
    const pendingCount = estimates.filter((e) => ["sent", "viewed"].includes(e.status)).length;

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    return (
        <PermissionGate resource="estimates" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Estimates"
                    description="Client-facing estimates and quotes with e-signature support and project conversion"
                >
                    <div className="flex items-center gap-2">
                        <SegmentedControl<ViewMode>
                            ariaLabel="Estimate view mode"
                            value={viewMode}
                            onValueChange={setViewMode}
                            options={[
                                {
                                    value: "cards",
                                    label: "Cards",
                                    icon: <LayoutGrid className="h-4 w-4" />,
                                    labelHidden: true,
                                },
                                {
                                    value: "table",
                                    label: "Table",
                                    icon: <Table2 className="h-4 w-4" />,
                                    labelHidden: true,
                                },
                            ]}
                        />
                        <CsvExportButton entity="estimates" />
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="h-4 w-4" /> New Estimate
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Pipeline"
                        value={formatCurrency(totalValue)}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Accepted Value"
                        value={formatCurrency(acceptedValue)}
                        icon={CheckCircle2}
                    />
                    <StatCard title="Pending Response" value={pendingCount} icon={Clock} />
                    <StatCard
                        title="Total Estimates"
                        value={estimates.length}
                        icon={FileSignature}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search estimates..."
                        className="flex-1 max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        {ESTIMATE_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {getStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                </div>

                {viewMode === "cards" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((est, i) => (
                            <StaggerItem key={est.id} index={i} stagger="relaxed">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-mono text-muted-foreground">
                                                        {est.number}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-bold truncate">
                                                    {est.title}
                                                </h3>
                                            </div>
                                            <StatusBadge
                                                status={est.status}
                                                className="text-[10px] ml-2 shrink-0"
                                            />
                                        </div>

                                        {est.companyName && (
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {est.companyName}
                                            </p>
                                        )}
                                        {est.contactName && (
                                            <p className="text-[10px] text-muted-foreground mb-3">
                                                {est.contactName}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-lg font-bold">
                                                {formatCurrency(est.total)}
                                            </span>
                                            {est.discountPercent > 0 && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {est.discountPercent}% discount
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span>{est.lineItems.length} line items</span>
                                                {est.lineItems.some((li) => li.optional) && (
                                                    <span>
                                                        {
                                                            est.lineItems.filter(
                                                                (li) => li.optional
                                                            ).length
                                                        }{" "}
                                                        optional
                                                    </span>
                                                )}
                                            </div>
                                            {est.validUntil && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Valid until {est.validUntil}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
                                            {est.sentAt && (
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Send className="h-3 w-3" /> Sent
                                                </span>
                                            )}
                                            {est.viewedAt && (
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Eye className="h-3 w-3" /> Viewed
                                                </span>
                                            )}
                                            {est.signedBy && (
                                                <span className="text-[10px] text-success flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Signed by{" "}
                                                    {est.signedBy}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                )}

                {viewMode === "table" && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="text-left p-3 font-medium">Number</th>
                                            <th className="text-left p-3 font-medium">Title</th>
                                            <th className="text-left p-3 font-medium">Client</th>
                                            <th className="text-left p-3 font-medium">Status</th>
                                            <th className="text-right p-3 font-medium">Total</th>
                                            <th className="text-left p-3 font-medium">
                                                Valid Until
                                            </th>
                                            <th className="text-left p-3 font-medium">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((est) => (
                                            <tr
                                                key={est.id}
                                                className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                                            >
                                                <td className="p-3 font-mono text-xs">
                                                    {est.number}
                                                </td>
                                                <td className="p-3 font-medium">{est.title}</td>
                                                <td className="p-3 text-muted-foreground">
                                                    {est.companyName || "—"}
                                                </td>
                                                <td className="p-3">
                                                    <StatusBadge
                                                        status={est.status}
                                                        className="text-[10px]"
                                                    />
                                                </td>
                                                <td className="p-3 text-right font-medium">
                                                    {formatCurrency(est.total)}
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    {est.validUntil || "—"}
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground">
                                                    {new Date(est.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            <CreateEntityDialog
                config={CREATE_ESTIMATE_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
