"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { CalendarRange } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "financial_period",
    titleKey: "name",
    statusKey: "status",
    icon: CalendarRange,
    backHref: "/financial-periods",
    backLabel: "Financial Periods",
    chatterRecordType: "financial_period",
    fields: [],
    relatedEntities: [
        {
            title: "Journal Entries",
            entityKey: "journal_entry",
            foreignKey: "financial_period_id",
            columns: [
                { id: "description", header: "Description", accessorKey: "description" },
                { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
                { id: "entry_date", header: "Date", accessorKey: "entry_date", fieldType: "date" },
            ],
            linkPattern: "/financial-periods/{id}",
        },
    ],
    tabs: [],
};

export function FinancialPeriodsDetailClient({
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
