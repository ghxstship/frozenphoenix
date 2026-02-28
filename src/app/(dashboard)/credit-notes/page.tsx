"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import {
    ReceiptText, Plus, DollarSign,
    FileText, ArrowDownRight, Loader2,
} from "lucide-react";
import { useCreditNotes, isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
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

const mockCreditNotes: CreditNote[] = [
    { id: "1", number: "CN-2026-001", invoiceNumber: "INV-2026-003", client: "Red Bull", project: "Red Bull Festival", reason: "Scope reduction — removed 2 LED walls", amount: 12000, status: "applied", issuedDate: "2026-02-18", appliedDate: "2026-02-20" },
    { id: "2", number: "CN-2026-002", invoiceNumber: "INV-2025-089", client: "TechStart", project: "TechStart Launch", reason: "Early payment discount (2%)", amount: 500, status: "issued", issuedDate: "2026-02-22", appliedDate: null },
    { id: "3", number: "CN-2026-003", invoiceNumber: "INV-2026-001", client: "Nike", project: "Nike Air Max Launch", reason: "Overcharge on labor hours", amount: 3750, status: "applied", issuedDate: "2026-02-10", appliedDate: "2026-02-12" },
    { id: "4", number: "CN-2026-004", invoiceNumber: "INV-2026-002", client: "Nike", project: "Nike Air Max Launch", reason: "Material substitution credit", amount: 8200, status: "draft", issuedDate: "2026-02-25", appliedDate: null },
];

export default function CreditNotesPage() {
    const [search, setSearch] = useState("");

    const { data: sbCreditNotes, isLoading } = useCreditNotes();

    const creditNotes: CreditNote[] = isSupabaseConfigured && sbCreditNotes
        ? sbCreditNotes.map((cn: Record<string, unknown>) => ({
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
        }))
        : mockCreditNotes;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = creditNotes.filter((cn) =>
        !search || cn.client.toLowerCase().includes(search.toLowerCase()) || cn.number.toLowerCase().includes(search.toLowerCase())
    );

    const totalIssued = creditNotes.filter((cn) => cn.status !== "void").reduce((s, cn) => s + cn.amount, 0);
    const totalApplied = creditNotes.filter((cn) => cn.status === "applied").reduce((s, cn) => s + cn.amount, 0);
    const pendingCredits = creditNotes.filter((cn) => cn.status === "issued" || cn.status === "draft").reduce((s, cn) => s + cn.amount, 0);

    return (
        <PermissionGate resource="credit_notes" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Credit Notes" description="Issue and track credit notes against client invoices">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Credit Note
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total Issued" value={formatCurrency(totalIssued)} description="all credit notes" icon={ReceiptText} />
                <StatCard title="Applied" value={formatCurrency(totalApplied)} description="against invoices" icon={ArrowDownRight} />
                <StatCard title="Pending" value={formatCurrency(pendingCredits)} description="to be applied" icon={DollarSign} />
            </div>

            <div className="flex items-center gap-4">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search credit notes..." className="flex-1 max-w-sm" />
            </div>

            <div className="space-y-2">
                {filtered.map((cn) => (
                    <Card key={cn.id} className="hover:bg-secondary/30 transition-colors cursor-pointer">
                        <CardContent className="flex items-center gap-4 py-3">
                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-muted-foreground">{cn.number}</span>
                                    <StatusBadge status={cn.status} className="text-[10px]" />
                                </div>
                                <p className="text-sm font-semibold">{cn.reason}</p>
                                <p className="text-xs text-muted-foreground">{cn.client} · Against {cn.invoiceNumber} · {cn.issuedDate}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-destructive">-{formatCurrency(cn.amount)}</p>
                                {cn.appliedDate && (
                                    <p className="text-[10px] text-muted-foreground">Applied {cn.appliedDate}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
        </PermissionGate>
    );
}
