"use client";

import { useRouter } from "next/navigation";
import { useDeleteExpense, useExpense, useUpdateExpense } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXPENSE_CATEGORY_LABELS } from "@/config/ui-variants";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { CheckCircle2, Receipt, Upload } from "lucide-react";

const CONFIG: DetailPageConfig = {
    entityKey: "expenses",
    titleKey: "description",
    subtitleFn: (r) => {
        const cat = (r.category as string) ?? "other";
        const proj = (r.project_name as string) ?? "";
        const label = EXPENSE_CATEGORY_LABELS[cat as keyof typeof EXPENSE_CATEGORY_LABELS] ?? cat;
        return proj ? `${label} · ${proj}` : label;
    },
    statusKey: "status",
    icon: Receipt,
    backHref: "/expenses",
    backLabel: "Expenses",
    chatterRecordType: "expense",
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "category", label: "Category", accessorKey: "category" },
        { id: "date", label: "Date", accessorKey: "date", fieldType: "date" },
        { id: "cost_center", label: "Cost Center", accessorKey: "cost_center" },
    ],
    fields: [
        { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "date", label: "Date", accessorKey: "date", fieldType: "date" },
        { id: "project_name", label: "Project", accessorKey: "project_name" },
        { id: "submitted_by", label: "Submitted By", accessorKey: "submitted_by" },
        {
            id: "reimbursement_method",
            label: "Reimbursement Method",
            accessorKey: "reimbursement_method",
        },
        { id: "approved_by", label: "Approved By", accessorKey: "approved_by" },
        { id: "approved_at", label: "Approved At", accessorKey: "approved_at", fieldType: "date" },
        { id: "notes", label: "Notes", accessorKey: "notes", fullWidth: true },
    ],
    tabs: [],
};

export function ExpenseDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { data: sbRecord, isLoading } = useExpense(id);
    const rec = (sbRecord ?? initialRecord) as Record<string, unknown> | null;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: id,
        entityLabel: "Expense",
        listPath: "/expenses",
        useUpdateHook: useUpdateExpense,
        useDeleteHook: useDeleteExpense,
    });

    const receiptUrl = (rec?.receipt_url as string) ?? (rec?.receiptUrl as string) ?? "";

    const config: DetailPageConfig = {
        ...CONFIG,
        tabs: [
            {
                id: "receipt",
                label: "Receipt",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Receipt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {receiptUrl ? (
                                <div className="rounded-lg border overflow-hidden">
                                    <div className="h-64 bg-secondary/30 flex items-center justify-center">
                                        <p className="text-sm text-muted-foreground">
                                            Receipt preview
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Upload className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        No receipt uploaded
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-3" disabled>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Receipt
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={rec}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                { label: "Edit Expense", onClick: () => router.push(`/expenses/${id}/edit`) },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Receipt className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm" onClick={() => handleUpdate({ status: "approved" })}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                </Button>
            }
        />
    );
}
