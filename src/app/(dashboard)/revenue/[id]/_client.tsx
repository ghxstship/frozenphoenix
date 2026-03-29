"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { TrendingUp } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "revenue_recognition_entry",
    titleKey: "name",
    statusKey: "status",
    icon: TrendingUp,
    backHref: "/revenue",
    backLabel: "Revenue",
    chatterRecordType: "revenue_recognition_entry",
    fields: [],
    relatedEntities: [
        {
            title: "Line Items",
            entityKey: "revenue_line_item",
            foreignKey: "revenue_recognition_entry_id",
            columns: [
                { id: "description", header: "Description", accessorKey: "description" },
                { id: "amount", header: "Amount", accessorKey: "amount", fieldType: "currency" },
                {
                    id: "recognized_date",
                    header: "Date",
                    accessorKey: "recognized_date",
                    fieldType: "date",
                },
            ],
        },
    ],
    tabs: [],
};

export function RevenueDetailClient({
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
