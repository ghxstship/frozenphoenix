"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Receipt } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "expense_report",
    titleKey: "name",
    statusKey: "status",
    icon: Receipt,
    backHref: "/expense-reports",
    backLabel: "Expense Reports",
    chatterRecordType: "expense_report",
    fields: [],
    relatedEntities: [
        {
            title: "Expenses",
            entityKey: "expense",
            foreignKey: "expense_report_id",
            columns: [
                { id: "description", header: "Description", accessorKey: "description" },
                { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
                { id: "date", header: "Date", accessorKey: "date", fieldType: "date" },
            ],
            linkPattern: "/expenses/{id}",
        },
    ],
    tabs: [],
};

export function ExpenseReportsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord?: Record<string, unknown> | null;
}) {
    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={initialRecord as Record<string, unknown> | undefined}
        />
    );
}
