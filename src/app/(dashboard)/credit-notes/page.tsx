"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_CREDIT_NOTE_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowDownRight, DollarSign, FileText, Loader2, Plus, ReceiptText } from "lucide-react";
import { useCreditNotes } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type CreditNoteStatus = "draft" | "issued" | "applied" | "void";

interface CreditNote {
    id: string;
    number: string;
    invoiceNumber: string;
    client: string;
    project: string;
    reason: string;
    amount: number;
    status: CreditNoteStatus;
    issuedDate: string;
    appliedDate: string | null;
}

export default function CreditNotesPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");

    const { data: sbCreditNotes, isLoading } = useCreditNotes();

    const creditNotes: CreditNote[] = (sbCreditNotes ?? []).map((cn: Record<string, unknown>) => ({
        id: (cn.id as string) ?? "",
        number: (cn.credit_note_number as string) ?? "",
        invoiceNumber: (cn.invoice_number as string) ?? "",
        client: (cn.client_name as string) ?? "",
        project: (cn.project_name as string) ?? "",
        reason: (cn.reason as string) ?? "",
        amount: (cn.amount as number) ?? 0,
        status: ((cn.status as string) ?? "draft") as CreditNoteStatus,
        issuedDate: (cn.issued_date as string) ?? "",
        appliedDate: (cn.applied_date as string) ?? null,
    }));

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    const filtered = creditNotes.filter(
        (cn) =>
            !search ||
            cn.client.toLowerCase().includes(search.toLowerCase()) ||
            cn.number.toLowerCase().includes(search.toLowerCase())
    );

    const totalIssued = creditNotes
        .filter((cn) => cn.status !== "void")
        .reduce((s, cn) => s + cn.amount, 0);
    const totalApplied = creditNotes
        .filter((cn) => cn.status === "applied")
        .reduce((s, cn) => s + cn.amount, 0);
    const pendingCredits = creditNotes
        .filter((cn) => cn.status === "issued" || cn.status === "draft")
        .reduce((s, cn) => s + cn.amount, 0);

    return (
        <PermissionGate resource="credit_notes" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Credit Notes"
                    description="Issue and track credit notes against client invoices"
                >
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Credit Note
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Issued"
                        value={formatCurrency(totalIssued)}
                        description="all credit notes"
                        icon={ReceiptText}
                    />
                    <StatCard
                        title="Applied"
                        value={formatCurrency(totalApplied)}
                        description="against invoices"
                        icon={ArrowDownRight}
                    />
                    <StatCard
                        title="Pending"
                        value={formatCurrency(pendingCredits)}
                        description="to be applied"
                        icon={DollarSign}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search credit notes..."
                        className="flex-1 max-w-sm"
                    />
                </div>

                <div className="space-y-2">
                    {filtered.map((cn) => (
                        <Card
                            key={cn.id}
                            className="hover:bg-secondary/30 transition-colors cursor-pointer"
                        >
                            <CardContent className="flex items-center gap-4 py-3">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-muted-foreground">
                                            {cn.number}
                                        </span>
                                        <StatusBadge status={cn.status} className="text-[10px]" />
                                    </div>
                                    <p className="text-sm font-semibold">{cn.reason}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {cn.client} · Against {cn.invoiceNumber} · {cn.issuedDate}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-destructive">
                                        -{formatCurrency(cn.amount)}
                                    </p>
                                    {cn.appliedDate && (
                                        <p className="text-[10px] text-muted-foreground">
                                            Applied {cn.appliedDate}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <CreateEntityDialog config={CREATE_CREDIT_NOTE_CONFIG} open={createOpen} onClose={closeCreate} />
        </PermissionGate>
    );
}
