"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useCallback, useState } from "react";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import { CsvImportDialog } from "@/components/csv/csv-import-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_EXPENSE_CONFIG } from "@/config/create-entity-configs";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Plus,
    Receipt,
    Upload,
    User,
} from "lucide-react";
import { useExpenses } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type ExpenseStatus = "pending" | "approved" | "rejected" | "reimbursed";
type ExpenseCategory =
    | "travel"
    | "equipment"
    | "meals"
    | "materials"
    | "transport"
    | "software"
    | "miscellaneous";

interface ExpenseItem {
    id: string;
    description: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    submittedBy: string;
    projectName: string;
    status: ExpenseStatus;
    receiptUrl?: string;
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    travel: "Travel",
    equipment: "Equipment",
    meals: "Meals & Entertainment",
    materials: "Materials",
    transport: "Transport",
    software: "Software",
    miscellaneous: "Misc",
};

export default function ExpensesPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbExpenses, isLoading, refetch } = useExpenses();
    const [importOpen, setImportOpen] = useState(false);

    const handleImportComplete = useCallback(() => {
        void refetch();
    }, [refetch]);

    const expenses: ExpenseItem[] = (sbExpenses ?? []).map((e: Record<string, unknown>) => ({
        id: (e.id as string) ?? "",
        description: (e.description as string) ?? "",
        category: ((e.category as string) ?? "miscellaneous") as ExpenseCategory,
        amount: (e.amount as number) ?? 0,
        date: (e.date as string) ?? "",
        submittedBy: (e.submitted_by as string) ?? "",
        projectName: (e.project_name as string) ?? "",
        status: ((e.status as string) ?? "pending") as ExpenseStatus,
        receiptUrl: (e.receipt_url as string) ?? undefined,
    }));

    if (isLoading) {
        return <LoadingState />;
    }

    const filtered = expenses.filter((e) => {
        const matchesSearch =
            e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = expenses
        .filter((e) => e.status === "pending")
        .reduce((sum, e) => sum + e.amount, 0);
    const reimbursedAmount = expenses
        .filter((e) => e.status === "reimbursed")
        .reduce((sum, e) => sum + e.amount, 0);

    return (
        <PermissionGate resource="expenses" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Expenses"
                    description="Track and manage expense reports and reimbursements"
                >
                    <div className="flex items-center gap-2">
                        <CsvExportButton entity="expenses" />
                        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                            <Upload className="h-4 w-4" />
                            Import CSV
                        </Button>
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Submit Expense
                        </Button>
                    </div>
                </PageHeader>
                <CsvImportDialog
                    entity="expenses"
                    open={importOpen}
                    onOpenChange={setImportOpen}
                    onImportComplete={handleImportComplete}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Expenses"
                        value={formatCurrency(totalSpent)}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Pending Approval"
                        value={formatCurrency(pendingAmount)}
                        icon={Clock}
                    />
                    <StatCard
                        title="Reimbursed"
                        value={formatCurrency(reimbursedAmount)}
                        icon={CheckCircle2}
                    />
                    <StatCard title="Submissions" value={expenses.length} icon={Receipt} />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search expenses..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {(["all", "pending", "approved", "rejected", "reimbursed"] as const).map(
                            (s) => (
                                <Button
                                    key={s}
                                    variant={statusFilter === s ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter(s)}
                                >
                                    {s === "all" ? "All" : getStatusLabel(s)}
                                </Button>
                            )
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {filtered.map((expense, i) => {
                        return (
                            <StaggerItem key={expense.id} index={i} stagger="relaxed">
                                <Card className="hover:shadow-sm transition-all">
                                    <CardContent className="py-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <StatusBadge status={expense.status} />
                                                    <Badge variant="ghost" className="text-[10px]">
                                                        {CATEGORY_LABELS[expense.category]}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-sm font-semibold mt-1">
                                                    {expense.description}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {expense.submittedBy}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(expense.date)}
                                                    </span>
                                                    <span>{expense.projectName}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-lg font-bold">
                                                    {formatCurrency(expense.amount)}
                                                </p>
                                                {expense.receiptUrl ? (
                                                    <span className="text-[10px] text-success">
                                                        Receipt attached
                                                    </span>
                                                ) : (
                                                    <button
                                                        className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto"
                                                        disabled
                                                    >
                                                        <Upload className="h-3 w-3" />
                                                        Add receipt
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-1">No expenses found</h3>
                            <p className="text-muted-foreground text-center">
                                Try adjusting your search or filters
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
            <CreateEntityDialog
                config={CREATE_EXPENSE_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
