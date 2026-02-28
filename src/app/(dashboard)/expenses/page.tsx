"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    Receipt, Plus, DollarSign, Calendar,
    User, CheckCircle2, Clock, Upload, Loader2,
} from "lucide-react";
import { useExpenses, isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type ExpenseStatus = "pending" | "approved" | "rejected" | "reimbursed";
type ExpenseCategory = "travel" | "equipment" | "meals" | "materials" | "transport" | "software" | "miscellaneous";

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
    travel: "Travel", equipment: "Equipment", meals: "Meals & Entertainment",
    materials: "Materials", transport: "Transport", software: "Software", miscellaneous: "Misc",
};

const mockExpenses: ExpenseItem[] = [
    { id: "1", description: "Flight to NYC — site visit", category: "travel", amount: 485, date: "2026-02-20", submittedBy: "Sarah Chen", projectName: "Nike Air Max Launch", status: "reimbursed" },
    { id: "2", description: "LED test panel rental", category: "equipment", amount: 1200, date: "2026-02-18", submittedBy: "Mike Johnson", projectName: "Nike Air Max Launch", status: "approved" },
    { id: "3", description: "Client dinner — Red Bull team", category: "meals", amount: 342, date: "2026-02-22", submittedBy: "Sarah Chen", projectName: "Red Bull Festival", status: "pending" },
    { id: "4", description: "Gaffer tape, zip ties, cable (bulk)", category: "materials", amount: 189, date: "2026-02-19", submittedBy: "David Kim", projectName: "Nike Air Max Launch", status: "reimbursed" },
    { id: "5", description: "Van rental — equipment transport", category: "transport", amount: 275, date: "2026-02-21", submittedBy: "Tom Harris", projectName: "Glossier Pop-Up", status: "pending" },
    { id: "6", description: "Figma annual subscription", category: "software", amount: 144, date: "2026-02-01", submittedBy: "Lisa Wang", projectName: "General", status: "approved" },
    { id: "7", description: "Uber rides — Brooklyn site visits (x4)", category: "transport", amount: 96, date: "2026-02-15", submittedBy: "Sarah Chen", projectName: "Nike Air Max Launch", status: "rejected" },
    { id: "8", description: "Safety harnesses (3x)", category: "equipment", amount: 450, date: "2026-02-17", submittedBy: "David Kim", projectName: "Nike Air Max Launch", status: "reimbursed" },
];

export default function ExpensesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbExpenses, isLoading } = useExpenses();

    const expenses: ExpenseItem[] = isSupabaseConfigured && sbExpenses
        ? sbExpenses.map((e: Record<string, unknown>) => ({
            id: (e.id as string) ?? "",
            description: (e.description as string) ?? "",
            category: ((e.category as string) ?? "miscellaneous") as ExpenseCategory,
            amount: (e.amount as number) ?? 0,
            date: (e.date as string) ?? "",
            submittedBy: (e.submitted_by as string) ?? "",
            projectName: (e.project_name as string) ?? "",
            status: ((e.status as string) ?? "pending") as ExpenseStatus,
            receiptUrl: (e.receipt_url as string) ?? undefined,
        }))
        : mockExpenses;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = expenses.filter((e) => {
        const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) || e.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = expenses.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
    const reimbursedAmount = expenses.filter(e => e.status === "reimbursed").reduce((sum, e) => sum + e.amount, 0);

    return (
        <PermissionGate resource="expenses" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Expenses" description="Track and manage expense reports and reimbursements">
                <Button size="sm"><Plus className="mr-2 h-4 w-4" />Submit Expense</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Expenses" value={formatCurrency(totalSpent)} icon={DollarSign} />
                <StatCard title="Pending Approval" value={formatCurrency(pendingAmount)} icon={Clock} />
                <StatCard title="Reimbursed" value={formatCurrency(reimbursedAmount)} icon={CheckCircle2} />
                <StatCard title="Submissions" value={expenses.length} icon={Receipt} />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search expenses..." className="flex-1 max-w-sm" />
                <div className="flex gap-2 flex-wrap">
                    {(["all", "pending", "approved", "rejected", "reimbursed"] as const).map((s) => (
                        <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
                            {s === "all" ? "All" : getStatusLabel(s)}
                        </Button>
                    ))}
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
                                            <Badge variant="ghost" className="text-[10px]">{CATEGORY_LABELS[expense.category]}</Badge>
                                        </div>
                                        <h3 className="text-sm font-semibold mt-1">{expense.description}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{expense.submittedBy}</span>
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(expense.date)}</span>
                                            <span>{expense.projectName}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-lg font-bold">{formatCurrency(expense.amount)}</p>
                                        {expense.receiptUrl ? (
                                            <span className="text-[10px] text-success">Receipt attached</span>
                                        ) : (
                                            <button className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto"><Upload className="h-3 w-3" />Add receipt</button>
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
                <Card><CardContent className="flex flex-col items-center justify-center py-12">
                    <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-1">No expenses found</h3>
                    <p className="text-muted-foreground text-center">Try adjusting your search or filters</p>
                </CardContent></Card>
            )}
        </div>
        </PermissionGate>
    );
}
