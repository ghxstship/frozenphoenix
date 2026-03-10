"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_PAYMENT_CONFIG } from "@/config/create-entity-configs";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Banknote, Loader2, Plus, TrendingUp } from "lucide-react";
import { usePayments } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type PaymentMethod = "bank_transfer" | "credit_card" | "check" | "ach" | "wire" | "other";
type PaymentDirection = "incoming" | "outgoing";

interface Payment {
    id: string;
    direction: PaymentDirection;
    invoiceNumber: string;
    counterparty: string;
    amount: number;
    method: PaymentMethod;
    date: string;
    reference: string;
    project: string;
    notes: string;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
    bank_transfer: "Bank Transfer",
    credit_card: "Credit Card",
    check: "Check",
    ach: "ACH",
    wire: "Wire",
    other: "Other",
};

export default function PaymentsPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const DIR_FILTERS = ["all", "incoming", "outgoing"] as const;
    const [dirFilter, setDirFilter] = useQueryTabState({
        key: "direction",
        defaultValue: "all",
        validValues: DIR_FILTERS,
    });

    const { data: sbPayments, isLoading } = usePayments();

    const payments: Payment[] = (sbPayments ?? []).map((p: Record<string, unknown>) => ({
        id: (p.id as string) ?? "",
        direction: ((p.direction as string) ?? "incoming") as PaymentDirection,
        invoiceNumber: (p.invoice_number as string) ?? "",
        counterparty: (p.counterparty as string) ?? "",
        amount: (p.amount as number) ?? 0,
        method: ((p.method as string) ?? "other") as PaymentMethod,
        date: (p.payment_date as string) ?? (p.date as string) ?? "",
        reference: (p.reference as string) ?? "",
        project: (p.project_name as string) ?? "",
        notes: (p.notes as string) ?? "",
    }));

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    const filtered = payments.filter((p) => {
        if (dirFilter !== "all" && p.direction !== dirFilter) return false;
        if (
            search &&
            !p.counterparty.toLowerCase().includes(search.toLowerCase()) &&
            !p.invoiceNumber.toLowerCase().includes(search.toLowerCase())
        )
            return false;
        return true;
    });

    const totalIncoming = payments
        .filter((p) => p.direction === "incoming")
        .reduce((s, p) => s + p.amount, 0);
    const totalOutgoing = payments
        .filter((p) => p.direction === "outgoing")
        .reduce((s, p) => s + p.amount, 0);
    const netCashFlow = totalIncoming - totalOutgoing;

    return (
        <PermissionGate resource="payments" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Payments"
                    description="Track incoming and outgoing payments across all projects"
                >
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Record Payment
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Received"
                        value={formatCurrency(totalIncoming)}
                        description="this period"
                        icon={ArrowDownRight}
                        change={15}
                    />
                    <StatCard
                        title="Paid Out"
                        value={formatCurrency(totalOutgoing)}
                        description="this period"
                        icon={ArrowUpRight}
                    />
                    <StatCard
                        title="Net Cash Flow"
                        value={formatCurrency(netCashFlow)}
                        description="incoming - outgoing"
                        icon={TrendingUp}
                        change={8}
                    />
                    <StatCard
                        title="Transactions"
                        value={payments.length}
                        description="this period"
                        icon={Banknote}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search payments..."
                        className="flex-1 max-w-sm"
                    />
                    <SegmentedControl
                        ariaLabel="Payment direction filter"
                        value={dirFilter}
                        onValueChange={(v) => setDirFilter(v as (typeof DIR_FILTERS)[number])}
                        size="sm"
                        options={[
                            { value: "all", label: "All" },
                            { value: "incoming", label: "Incoming" },
                            { value: "outgoing", label: "Outgoing" },
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    {filtered.map((p) => (
                        <Card
                            key={p.id}
                            className="hover:bg-secondary/30 transition-colors cursor-pointer"
                        >
                            <CardContent className="flex items-center gap-4 py-3">
                                <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${p.direction === "incoming" ? "bg-success/10" : "bg-destructive/10"}`}
                                >
                                    {p.direction === "incoming" ? (
                                        <ArrowDownRight className="h-5 w-5 text-success" />
                                    ) : (
                                        <ArrowUpRight className="h-5 w-5 text-destructive" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold">{p.counterparty}</p>
                                        <Badge variant="ghost" className="text-[10px]">
                                            {METHOD_LABELS[p.method]}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {p.invoiceNumber} · {p.project} · Ref: {p.reference}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p
                                        className={`text-sm font-bold ${p.direction === "incoming" ? "text-success" : "text-destructive"}`}
                                    >
                                        {p.direction === "incoming" ? "+" : "-"}
                                        {formatCurrency(p.amount)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">{p.date}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <CreateEntityDialog config={CREATE_PAYMENT_CONFIG} open={createOpen} onClose={closeCreate} />
        </PermissionGate>
    );
}
