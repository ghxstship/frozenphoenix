"use client";

import { ListPageShell } from "@/components/shells";
import { useExpenses } from "@/lib/supabase";
import { EXPENSES_PAGE } from "@/config/list-page-configs";
import { CheckCircle2, Clock, DollarSign, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    ...EXPENSES_PAGE,
    title: "Expenses",
    createLabel: "Submit Expense",
    exportable: true,
    importable: true,
    stats: [
        {
            label: "Total Expenses",
            icon: DollarSign,
            compute: (records) =>
                formatCurrency(records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)),
        },
        {
            label: "Pending Approval",
            icon: Clock,
            compute: (records) =>
                formatCurrency(
                    records
                        .filter((r) => r.status === "pending")
                        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
                ),
        },
        {
            label: "Reimbursed",
            icon: CheckCircle2,
            compute: (records) =>
                formatCurrency(
                    records
                        .filter((r) => r.status === "reimbursed")
                        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
                ),
        },
        { label: "Submissions", icon: Receipt, filter: () => true },
    ],
    filters: [
        {
            id: "status",
            label: "Status",
            column: "status",
            options: [
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "reimbursed", label: "Reimbursed" },
            ],
        },
    ],
    columns: [
        { id: "description", header: "Description", accessorKey: "description" },
        { id: "category", header: "Category", accessorKey: "category" },
        { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "submitted_by", header: "Submitted By", accessorKey: "submitted_by" },
        { id: "date", header: "Date", accessorKey: "date", fieldType: "date" },
        { id: "project_name", header: "Project", accessorKey: "project_name" },
    ],
};

export default function ExpensesPage() {
    const { data: rawData, isLoading } = useExpenses();
    const data = (rawData ?? []) as unknown as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
