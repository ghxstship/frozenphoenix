"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Calculator } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "job_cost_entry",
    titleKey: "name",
    statusKey: "status",
    icon: Calculator,
    backHref: "/job-costing",
    backLabel: "Job Costing",
    chatterRecordType: "job_cost_entry",
    fields: [],
    relatedEntities: [
        {
            title: "Labor Entries",
            entityKey: "job_cost_labor",
            foreignKey: "job_cost_entry_id",
            columns: [
                { id: "worker_name", header: "Worker", accessorKey: "worker_name" },
                { id: "hours", header: "Hours", accessorKey: "hours", fieldType: "number" },
                { id: "cost", header: "Cost", accessorKey: "cost", fieldType: "currency" },
            ],
        },
        {
            title: "Material Entries",
            entityKey: "job_cost_material",
            foreignKey: "job_cost_entry_id",
            columns: [
                { id: "description", header: "Description", accessorKey: "description" },
                { id: "quantity", header: "Qty", accessorKey: "quantity", fieldType: "number" },
                { id: "cost", header: "Cost", accessorKey: "cost", fieldType: "currency" },
            ],
        },
    ],
    tabs: [],
};

export function JobCostingDetailClient({
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
