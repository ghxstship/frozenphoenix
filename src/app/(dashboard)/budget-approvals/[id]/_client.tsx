"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { CheckCircle2 } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "budget_approval",
    titleKey: "name",
    statusKey: "status",
    icon: CheckCircle2,
    backHref: "/budget-approvals",
    backLabel: "Budget Approvals",
    chatterRecordType: "budget_approval",
    fields: [],
    relatedEntities: [
        {
            title: "Line Items",
            entityKey: "budget_line_item",
            foreignKey: "budget_approval_id",
            columns: [
                { id: "description", header: "Description", accessorKey: "description" },
                { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
            linkPattern: "/budgets/{id}",
        },
    ],
    tabs: [],
};

export function BudgetApprovalsDetailClient({
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
