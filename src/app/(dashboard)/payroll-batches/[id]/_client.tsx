"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Banknote } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "payroll_batch",
    titleKey: "name",
    statusKey: "status",
    icon: Banknote,
    backHref: "/payroll-batches",
    backLabel: "Payroll Batches",
    chatterRecordType: "payroll_batch",
    fields: [],
    relatedEntities: [
        {
            title: "Payroll Entries",
            entityKey: "payroll_entry",
            foreignKey: "payroll_batch_id",
            columns: [
                { id: "employee_name", header: "Employee", accessorKey: "employee_name" },
                {
                    id: "gross_amount",
                    header: "Gross",
                    accessorKey: "gross_amount",
                    fieldType: "currency",
                },
                {
                    id: "net_amount",
                    header: "Net",
                    accessorKey: "net_amount",
                    fieldType: "currency",
                },
                { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
            ],
        },
    ],
    tabs: [],
};

export function PayrollBatchesDetailClient({
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
