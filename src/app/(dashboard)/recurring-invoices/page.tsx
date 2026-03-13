"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_RECURRING_INVOICE_CONFIG } from "@/config/create-entity-configs";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { Calendar, DollarSign, Pause, Play, Plus, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { useRecurringInvoices, useUpdateRecurringInvoice } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type RecurringStatus = "active" | "paused" | "completed" | "cancelled";
type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";

interface RecurringInvoice {
    id: string;
    title: string;
    client: string;
    project: string;
    amount: number;
    frequency: Frequency;
    status: RecurringStatus;
    nextDate: string;
    lastGenerated: string | null;
    totalGenerated: number;
    totalCollected: number;
    occurrencesLeft: number | null;
}

const FREQ_LABELS: Record<Frequency, string> = {
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    annually: "Annually",
};

export default function RecurringInvoicesPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const updateRecurring = useUpdateRecurringInvoice();
    const [search, setSearch] = useState("");

    const { data: sbRecurring, isLoading } = useRecurringInvoices();

    const invoices: RecurringInvoice[] = (sbRecurring ?? []).map((r: Record<string, unknown>) => ({
        id: (r.id as string) ?? "",
        title: (r.title as string) ?? "",
        client: (r.client_name as string) ?? (r.client as string) ?? "",
        project: (r.project_name as string) ?? (r.project as string) ?? "",
        amount: (r.amount as number) ?? 0,
        frequency: ((r.frequency as string) ?? "monthly") as Frequency,
        status: ((r.status as string) ?? "active") as RecurringStatus,
        nextDate: (r.next_date as string) ?? "",
        lastGenerated: (r.last_generated as string) ?? null,
        totalGenerated: (r.total_generated as number) ?? 0,
        totalCollected: (r.total_collected as number) ?? 0,
        occurrencesLeft: (r.occurrences_left as number) ?? null,
    }));

    if (isLoading) {
        return <LoadingState />;
    }

    const filtered = invoices.filter(
        (r) =>
            !search ||
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.client.toLowerCase().includes(search.toLowerCase())
    );

    const monthlyRecurring = invoices
        .filter((r) => r.status === "active")
        .reduce((s, r) => {
            const multiplier =
                r.frequency === "weekly"
                    ? 4.33
                    : r.frequency === "biweekly"
                      ? 2.17
                      : r.frequency === "monthly"
                        ? 1
                        : r.frequency === "quarterly"
                          ? 0.33
                          : 0.083;
            return s + r.amount * multiplier;
        }, 0);
    const totalCollected = invoices.reduce((s, r) => s + r.totalCollected, 0);
    const activeCount = invoices.filter((r) => r.status === "active").length;

    return (
        <PermissionGate resource="recurring_invoices" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Recurring Invoices"
                    description="Automate invoice generation on a schedule"
                >
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Recurring Invoice
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Monthly Recurring"
                        value={formatCurrency(monthlyRecurring)}
                        description="estimated monthly value"
                        icon={RefreshCw}
                    />
                    <StatCard
                        title="Total Collected"
                        value={formatCurrency(totalCollected)}
                        description="all time"
                        icon={DollarSign}
                        change={12}
                    />
                    <StatCard
                        title="Active Schedules"
                        value={activeCount}
                        description="generating invoices"
                        icon={Calendar}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search recurring invoices..."
                        className="flex-1 max-w-sm"
                    />
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={RefreshCw}
                        title="No recurring invoices found"
                        description={
                            search
                                ? "Try adjusting your search"
                                : "Set up your first recurring invoice"
                        }
                        action={
                            !search
                                ? { label: "New Recurring Invoice", onClick: openCreate }
                                : undefined
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {filtered.map((r) => (
                            <Card
                                key={r.id}
                                className="hover:bg-secondary/30 transition-colors cursor-pointer"
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-semibold">{r.title}</p>
                                                <StatusBadge
                                                    status={r.status}
                                                    className="text-[10px]"
                                                />
                                                <Badge variant="ghost" className="text-[10px]">
                                                    {FREQ_LABELS[r.frequency]}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {r.client} · {r.project}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                {r.nextDate && (
                                                    <span>
                                                        Next:{" "}
                                                        <strong className="text-foreground">
                                                            {r.nextDate}
                                                        </strong>
                                                    </span>
                                                )}
                                                <span>
                                                    Generated:{" "}
                                                    <strong className="text-foreground">
                                                        {r.totalGenerated}
                                                    </strong>{" "}
                                                    invoices
                                                </span>
                                                {r.occurrencesLeft !== null &&
                                                    r.occurrencesLeft > 0 && (
                                                        <span>{r.occurrencesLeft} remaining</span>
                                                    )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="text-right">
                                                <p className="text-lg font-bold">
                                                    {formatCurrency(r.amount)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    per{" "}
                                                    {r.frequency === "monthly"
                                                        ? "month"
                                                        : r.frequency}
                                                </p>
                                            </div>
                                            {r.status === "active" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    title="Pause"
                                                    disabled={updateRecurring.isPending}
                                                    onClick={() =>
                                                        updateRecurring.mutate({
                                                            id: r.id,
                                                            status: "paused",
                                                        })
                                                    }
                                                >
                                                    <Pause className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {r.status === "paused" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    title="Resume"
                                                    disabled={updateRecurring.isPending}
                                                    onClick={() =>
                                                        updateRecurring.mutate({
                                                            id: r.id,
                                                            status: "active",
                                                        })
                                                    }
                                                >
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <CreateEntityDialog
                config={CREATE_RECURRING_INVOICE_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
